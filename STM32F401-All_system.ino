
#include <Wire.h>

// I2C configuration for ESP8266 communication
// Using I2C2 (second I2C bus) since I2C1 is used for MPU6050
#define I2C_ADDR 0x08
#define SDA2_PIN PB3  // I2C2 SDA pin
#define SCL2_PIN PB10 // I2C2 SCL pin

// Komut kodları
#define CMD_START 0x01
#define CMD_STOP 0x00
#define CMD_REQUEST_DATA 0x02
#define CMD_STATUS 0x03

// Durum kodları
#define STATUS_READY 0xAA
#define STATUS_BUSY 0xBB
#define STATUS_ERROR 0xEE

// Global değişkenler
volatile uint8_t current_command = 0;
volatile bool data_requested = false;
volatile bool system_running = false;
volatile uint8_t system_status = STATUS_READY;

// Sahte sensör verileri
struct SensorData {
  int16_t temperature; // 0.01°C hassasiyet
  int16_t humidity;    // 0.01% hassasiyet
};

SensorData sensor_data;
unsigned long last_sensor_update = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 1000; // 1 saniye

void setup() {
  Serial.begin(115200);
  delay(1000); // Serial başlatma bekleme
  Serial.println("STM32F401 I2C2 Slave başlatılıyor...");
  Serial.println("ESP8266 ile otomatik veri paylaşımı için hazırlanıyor...");
  
  // I2C2 slave olarak başlat (MPU6050 I2C1'de kullanıldığı için I2C2 kullanıyoruz)
  Wire.setSDA(SDA2_PIN);  // PB3
  Wire.setSCL(SCL2_PIN);  // PB10
  Wire.begin(I2C_ADDR);
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  
  Serial.println("I2C2 pinleri ayarlandı:");
  Serial.print("SDA2: PB3, SCL2: PB10");
  Serial.println();
  
  // İlk sensör verilerini oluştur
  generateSensorData();
  
  Serial.print("STM32 hazır - I2C2 Slave aktif (Adres: 0x");
  Serial.print(I2C_ADDR, HEX);
  Serial.println(") - ESP8266 ile iletişim için I2C2 kullanılıyor");
  Serial.println("NOT: I2C1 MPU6050 için ayrılmıştır");
  Serial.println("Sistem otomatik olarak her 3 saniyede ESP8266'ya veri gönderecek");
  
  // Test LED (isteğe bağlı)
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  
  // Sistem otomatik olarak başlasın
  system_running = true;
  system_status = STATUS_READY;
  Serial.println("Sistem otomatik olarak başlatıldı - veri gönderimi hazır");
}

void loop() {
  // Periyodik sensör verisi güncelleme
  if (system_running && millis() - last_sensor_update >= SENSOR_UPDATE_INTERVAL) {
    generateSensorData();
    last_sensor_update = millis();
  }
  
  // Komut işleme (interrupt dışında)
  static uint8_t last_processed_command = 0xFF;
  if (current_command != last_processed_command) {
    switch (current_command) {
      case CMD_START:
        Serial.println("Sistem başlatıldı");
        break;
      case CMD_STOP:
        Serial.println("Sistem durduruldu");
        break;
      case CMD_REQUEST_DATA:
        Serial.println("Veri istendi - hazırlanıyor...");
        // Güncel veriyi hazırla
        if (system_running) {
          generateSensorData();
          system_status = STATUS_READY;
          Serial.println("Veri hazırlandı ve gönderilmeye hazır");
        }
        break;
    }
    last_processed_command = current_command;
  }
  
  // CPU yükünü azalt
  delay(5);
}

// Master'dan veri alındığında çağrılır
void receiveEvent(int bytes) {
  // Tüm gelen verileri oku (buffer temizleme)
  while (Wire.available()) {
    uint8_t command = Wire.read();
    current_command = command;
    
    // Interrupt içinde delay kullanma - sadece flag'ları set et
    switch (command) {
      case CMD_START:
        system_running = true;
        system_status = STATUS_READY;
        break;
        
      case CMD_STOP:
        system_running = false;
        system_status = STATUS_READY;
        data_requested = false;
        break;
        
      case CMD_REQUEST_DATA:
        if (system_running) {
          data_requested = true;
          system_status = STATUS_READY; // Veri hazır durumuna geç
          // Güncel sensör verisi oluştur
          generateSensorData();
        } else {
          system_status = STATUS_ERROR;
        }
        break;
        
      case CMD_STATUS:
        // Sadece durum sorgusu - herhangi bir işlem yapma
        break;
        
      default:
        system_status = STATUS_ERROR;
        break;
    }
  }
}

// Master veri istediğinde çağrılır
void requestEvent() {
  static unsigned long last_request = 0;
  last_request = millis();
  
  if (current_command == CMD_STATUS) {
    // Durum bilgisi gönder
    Wire.write(system_status);
    Serial.print("Durum gönderildi: 0x");
    Serial.println(system_status, HEX);
  }
  else if (data_requested && system_running) {
    // Sensör verilerini gönder (4 byte)
    uint8_t data[4];
    
    // Interrupt-safe veri kopyalama
    noInterrupts();
    int16_t temp = sensor_data.temperature;
    int16_t hum = sensor_data.humidity;
    interrupts();
    
    // Sıcaklık verisi (2 byte, big-endian)
    data[0] = (temp >> 8) & 0xFF;
    data[1] = temp & 0xFF;
    
    // Nem verisi (2 byte, big-endian)
    data[2] = (hum >> 8) & 0xFF;
    data[3] = hum & 0xFF;
    
    // Veriyi gönder
    Wire.write(data, 4);
    data_requested = false;
    
    // Debug çıktısı
    Serial.print("Veri gönderildi - Sıcaklık: ");
    Serial.print(temp / 100.0, 2);
    Serial.print("°C, Nem: ");
    Serial.print(hum / 100.0, 2);
    Serial.print("% [Raw: ");
    Serial.print(temp);
    Serial.print(", ");
    Serial.print(hum);
    Serial.println("]");
    
    // LED blink (veri gönderildi göstergesi)
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }
  else {
    // Hata durumu veya sistem çalışmıyor
    uint8_t error_data[4] = {0, 0, 0, 0};
    Wire.write(error_data, 4);
    
    if (!system_running) {
      Serial.println("Hata: Sistem çalışmıyor - sıfır değerleri gönderildi");
    } else {
      Serial.println("Hata: Veri istenmedi - sıfır değerleri gönderildi");
    }
  }
}

// Sahte sensör verisi oluştur
void generateSensorData() {
  // Gerçekçi sıcaklık verisi (18-28°C arası)
  float temp = 20.0 + 8.0 * sin(millis() / 10000.0) + random(-200, 200) / 100.0;
  sensor_data.temperature = (int16_t)(temp * 100); // 0.01°C hassasiyet
  
  // Gerçekçi nem verisi (40-80% arası)
  float hum = 60.0 + 20.0 * cos(millis() / 15000.0) + random(-300, 300) / 100.0;
  if (hum < 0) hum = 0;
  if (hum > 100) hum = 100;
  sensor_data.humidity = (int16_t)(hum * 100); // 0.01% hassasiyet
  
  // Debug çıktısı (her 10 saniyede bir veya manuel çağrı)
  static unsigned long last_debug = 0;
  static bool manual_call = false;
  
  // Manuel çağrı veya periyodik debug için kontrol
  if (millis() - last_debug >= 10000 || manual_call) {
    Serial.print("Sensör verisi güncellendi - Sıcaklık: ");
    Serial.print(sensor_data.temperature / 100.0, 2);
    Serial.print("°C, Nem: ");
    Serial.print(sensor_data.humidity / 100.0, 2);
    Serial.print("% [Raw: ");
    Serial.print(sensor_data.temperature);
    Serial.print(", ");
    Serial.print(sensor_data.humidity);
    Serial.println("]");
    last_debug = millis();
    manual_call = false;
  }
}