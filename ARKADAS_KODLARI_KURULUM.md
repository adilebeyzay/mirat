# Arkadaşınızın Kodları - Kurulum Rehberi

## 📁 **Dosya Yapısı**

Arkadaşınızın eklediği dosyalar:

```
├── STM32F401_SensorCollector.ino    # Sensör veri toplama (I2C Slave)
├── ESP8266_CommunicationBridge.ino  # I2C Master + TCP Client
├── Deneyap_AP_V3.ino                # ESP32 TCP Server + WebSocket
├── STM32F103_MotorController_LED.ino # Motor kontrol
└── STM32F401-All_system.ino         # Tüm sistem
```

## 🔌 **Sistem Mimarisi**

```
[Mobil Uygulama] ←→ [ESP32 Deneyap AP] ←→ [ESP8266 Bridge] ←→ [STM32F401 Sensörler]
                                                              ←→ [STM32F103 Motorlar]
```

## ⚙️ **Kurulum Adımları**

### 1. **STM32F401 Sensör Toplayıcı**
- **Dosya**: `STM32F401_SensorCollector.ino`
- **Fonksiyon**: Sensör verilerini toplar (I2C Slave, Address: 0x10)
- **Sensörler**: 2x Ultrasonik, 2x Gaz, 2x IMU
- **Veri Formatı**: Risk değerleri (1=safe, 2=warning, 3=danger)

### 2. **ESP8266 İletişim Köprüsü**
- **Dosya**: `ESP8266_CommunicationBridge.ino`
- **Fonksiyon**: I2C Master + TCP Client
- **WiFi**: "Deneyap_AP" ağına bağlanır
- **TCP Server**: 192.168.4.1:4000 (ESP32'ye bağlanır)

### 3. **ESP32 Deneyap AP**
- **Dosya**: `Deneyap_AP_V3.ino`
- **Fonksiyon**: TCP Server + WebSocket Server
- **AP Adı**: "Deneyap_AP"
- **Şifre**: "miratrobot"
- **TCP Port**: 4000
- **WebSocket Port**: 81

### 4. **STM32F103 Motor Kontrol**
- **Dosya**: `STM32F103_MotorController_LED.ino`
- **Fonksiyon**: Motor kontrolü (I2C Slave, Address: 0x20)

## 📱 **Mobil Uygulama Ayarları**

Mobil uygulama şu ayarlarla çalışır:

```javascript
// TCP Bağlantı Ayarları
IP: 192.168.4.1
Port: 4000
Kimlik: "MOBILE"
```

## 🔄 **Veri Akışı**

1. **STM32F401** → Sensör verilerini toplar
2. **ESP8266** → I2C ile STM32F401'den veri alır
3. **ESP8266** → TCP ile ESP32'ye veri gönderir
4. **ESP32** → Mobil uygulamaya veri iletir

## 📊 **Veri Formatı**

ESP32'den mobil uygulamaya gelen veri:

```
sensor_data:ultrasonic1_risk,ultrasonic2_risk,gas1_risk,gas2_risk,imu1_x,imu1_y,imu1_z,imu2_x,imu2_y,imu2_z
```

**Risk Değerleri:**
- `1` = Güvenli (Safe)
- `2` = Uyarı (Warning)  
- `3` = Tehlikeli (Danger)

**IMU Değerleri:**
- `0-255` arası (128 = 0g, <128 = negatif, >128 = pozitif)

## 🚀 **Çalıştırma Sırası**

1. **ESP32'yi çalıştırın** (Deneyap_AP_V3.ino)
2. **STM32F401'yi çalıştırın** (STM32F401_SensorCollector.ino)
3. **STM32F103'ü çalıştırın** (STM32F103_MotorController_LED.ino)
4. **ESP8266'yı çalıştırın** (ESP8266_CommunicationBridge.ino)
5. **Mobil uygulamayı açın** ve "Deneyap_AP" ağına bağlanın

## 🔧 **Sorun Giderme**

### WiFi Bağlantı Sorunu
- ESP32'nin "Deneyap_AP" ağını oluşturduğundan emin olun
- Şifre: "miratrobot"

### TCP Bağlantı Sorunu
- ESP32'nin TCP server'ının çalıştığından emin olun
- Port 4000'in açık olduğundan emin olun

### I2C Bağlantı Sorunu
- STM32F401 (0x10) ve STM32F103 (0x20) adreslerini kontrol edin
- I2C kablolarını kontrol edin

## 📝 **Notlar**

- Tüm cihazlar aynı I2C bus'ı kullanır
- ESP8266 hem I2C Master hem de TCP Client olarak çalışır
- ESP32 hem TCP Server hem de WebSocket Server olarak çalışır
- Mobil uygulama TCP üzerinden veri alır

