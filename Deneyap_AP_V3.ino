#include <WiFi.h>
#include <WebSocketsServer.h>

// RGB LED pin tanımlamaları
const char* ssid = "Deneyap_AP";
const char* password = "miratrobot";

#define Rp D15
#define Mbl D14

// Sunucu nesneleri
WiFiServer tcpServer(4000);
WebSocketsServer webSocketServer(81);

// İstemciler
WiFiClient rpClient;
WiFiClient mobileClient;
uint8_t webSocketClientNum = 255;

// Fonksiyon prototipleri
// Derleyicinin bu fonksiyonların varlığından haberdar olması için gereklidir.
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);
void handleMobileCommand(String command);

//---
void setup() {
  Serial.begin(115200);
  pinMode(Rp, OUTPUT);
  pinMode(Mbl, OUTPUT);
  digitalWrite(Rp, LOW);
  digitalWrite(Mbl, LOW);

  Serial.println("Access Point baslatiliyor...");
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP Adresi: ");
  Serial.println(IP);

  // TCP sunucuyu başlat
  tcpServer.begin();
  Serial.println("TCP Sunucu baslatildi (Port 4000).");
  
  // WebSocket sunucuyu başlat
  webSocketServer.begin();
  webSocketServer.onEvent(webSocketEvent);
  Serial.println("WebSocket Sunucu baslatildi (Port 81).");
  Serial.println("WebSocket URL: ws://" + IP.toString() + ":81/");

  // LED test animasyonu
  unsigned long currentMillis = millis();
  while (millis() - currentMillis < 400) {
    if ((millis() / 50) % 2 == 0) {
      digitalWrite(Rp, HIGH);
      digitalWrite(Mbl, HIGH);
    } else {
      digitalWrite(Rp, LOW);
      digitalWrite(Mbl, LOW);
    }
  }
}

//---
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED: {
      Serial.printf("[WebSocket] Client #%u disconnected!\n", num);
      if (webSocketClientNum == num) {
        webSocketClientNum = 255;
        digitalWrite(Mbl, LOW);
        Serial.println("WebSocket mobil baglanti koptu, LED söndürülüyor.");
      }
      break;
    }
      
    case WStype_CONNECTED: {
      IPAddress ip = webSocketServer.remoteIP(num);
      Serial.printf("[WebSocket] Client #%u connected from %d.%d.%d.%d\n", 
                    num, ip[0], ip[1], ip[2], ip[3]);
      webSocketServer.sendTXT(num, "ESP32_READY");
      break;
    }
      
    case WStype_TEXT: {
      Serial.printf("[WebSocket] Client #%u sent: %s\n", num, payload);
      String message = String((char*)payload);
        
      if (webSocketClientNum == 255 && message == "MOBILE") {
        webSocketClientNum = num;
        digitalWrite(Mbl, HIGH);
        Serial.println("WebSocket mobil istemci tanımlandı!");
        webSocketServer.sendTXT(num, "MOBILE_IDENTIFIED");
        return;
      }
        
      if (webSocketClientNum == num) {
        handleMobileCommand(message);
        if (rpClient && rpClient.connected()) {
          rpClient.println(message);
        }
      } else {
        Serial.println("Tanımlanmamış WebSocket istemcisinden mesaj, reddedildi.");
      }
      break;
    }
      
    case WStype_BIN: {
      Serial.printf("[WebSocket] Binary data received from #%u\n", num);
      break;
    }
      
    default:
      break;
  }
}

//---
void handleMobileCommand(String command) {
  Serial.println("[SERVER] WebSocket MOBILE'dan komut alindi: " + command);
  if (command.startsWith("motor_ct")) {
    String motorValue = command.substring(command.indexOf(':') + 1);
    Serial.println("Motor kontrol verisi: " + motorValue);
    if (webSocketClientNum != 255) {
      webSocketServer.sendTXT(webSocketClientNum, "MOTOR_CMD_OK");
    }
  } else if (command.startsWith("lidar_scan")) {
    String lidarCommand = command.substring(command.indexOf(':') + 1);
    Serial.println("Lidar komutu: " + lidarCommand);
    if (webSocketClientNum != 255) {
      webSocketServer.sendTXT(webSocketClientNum, "LIDAR_CMD_OK");
    }
  } else if (command.startsWith("motor_spd")) {
    String speedValue = command.substring(command.indexOf(':') + 1);
    Serial.println("Motor hiz verisi: " + speedValue);
    if (webSocketClientNum != 255) {
      webSocketServer.sendTXT(webSocketClientNum, "SPEED_CMD_OK");
    }
  } else {
    Serial.println("Bilinmeyen komut alindi!");
    if (webSocketClientNum != 255) {
      webSocketServer.sendTXT(webSocketClientNum, "UNKNOWN_CMD");
    }
  }
}

//---
void loop() {
  webSocketServer.loop();
  WiFiClient newClient = tcpServer.available();
  if (newClient) {
    if (rpClient && rpClient.connected() && mobileClient && mobileClient.connected()) {
      Serial.println("Maksimum TCP istemci sayisina ulasildi, yeni baglanti reddedildi.");
      newClient.stop();
    } else {
      Serial.println("Yeni TCP istemci baglandi, kimlik bekleniyor...");
      unsigned long start = millis();
      String identity = "";
      while (newClient.connected() && millis() - start < 5000) {
        if (newClient.available()) {
          char c = newClient.read();
          if (c == '\n') break;
          identity += c;
        }
      }
      identity.trim();
      if (identity == "RP") {
        Serial.println("TCP Raspberry Pi baglandi!");
        rpClient = newClient;
        digitalWrite(Rp, HIGH);
      } else if (identity == "MOBILE") {
        Serial.println("TCP Mobil uygulama baglandi!");
        mobileClient = newClient;
        digitalWrite(Mbl, HIGH);
      } else {
        Serial.println("Bilinmeyen TCP istemci, baglanti kapatildi.");
        newClient.stop();
      }
    }
  }

  if (rpClient && rpClient.connected()) {
    while (rpClient.available()) {
      String dataFromRP = rpClient.readStringUntil('\n');
      Serial.println("[SERVER] Raspberry Pi'dan veri alindi: " + dataFromRP);
        
      if (mobileClient && mobileClient.connected()) {
        mobileClient.println(dataFromRP);
      }
        
      if (webSocketClientNum != 255) {
        webSocketServer.sendTXT(webSocketClientNum, dataFromRP);
      }
    }
  }

  if (mobileClient && mobileClient.connected()) {
    while (mobileClient.available()) {
      String commandFromMobile = mobileClient.readStringUntil('\n');
      Serial.println("[SERVER] TCP MOBILE'dan komut alindi: " + commandFromMobile);
        
      handleMobileCommand(commandFromMobile);
        
      if (rpClient && rpClient.connected()) {
        rpClient.println(commandFromMobile);
      }
    } 
  }
    
  if (rpClient && !rpClient.connected()) {
    Serial.println("Raspberry Pi baglantisi koptu!");
    rpClient.stop();
    digitalWrite(Rp, LOW);
  }

  if (mobileClient && !mobileClient.connected()) {
    Serial.println("TCP Mobil baglanti koptu, LED söndürülüyor.");
    mobileClient.stop();
    digitalWrite(Mbl, LOW);
  }
}