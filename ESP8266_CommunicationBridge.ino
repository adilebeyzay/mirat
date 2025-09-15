/*
 * ESP8266 Communication Bridge - I2C Master + TCP Client
 * 
 * Hardware: ESP8266 (NodeMCU or similar)
 * 
 * Function: 
 * - I2C Master for STM32F401 (sensors) and STM32F103 (motors)
 * - TCP client to ESP32 server
 * - Data bridge between I2C devices and TCP server
 */

#include <ESP8266WiFi.h>
#include <Wire.h>

// WiFi Configuration
const char* ssid = "Deneyap_AP";        // ESP32 AP name
const char* password = "miratrobot";     // ESP32 AP password

// TCP Server Configuration (ESP32)
const char* tcp_server_ip = "192.168.4.1";  // ESP32 AP IP
const int tcp_server_port = 4000;           // ESP32 TCP port

// I2C Slave Addresses
#define STM32F401_ADDR 0x10  // Sensor collector
#define STM32F103_ADDR 0x12  // Motor controller

// I2C Commands
#define CMD_REQUEST_SENSORS 0x01
#define CMD_STATUS 0x02

// Motor Commands
#define MOTOR_STOP     0x00
#define MOTOR_FORWARD  0x01
#define MOTOR_BACKWARD 0x02
#define MOTOR_RIGHT    0x03
#define MOTOR_LEFT     0x04

// Global variables
WiFiClient tcpClient;
bool wifi_connected = false;
bool tcp_connected = false;
unsigned long last_sensor_request = 0;
unsigned long last_connection_attempt = 0;
unsigned long last_heartbeat = 0;

const unsigned long SENSOR_REQUEST_INTERVAL = 500;   // 500ms
const unsigned long RECONNECT_INTERVAL = 5000;       // 5 seconds
const unsigned long HEARTBEAT_INTERVAL = 10000;      // 10 seconds

// Sensor data structure
struct SensorPacket {
  uint8_t ultrasonic1_risk;
  uint8_t ultrasonic2_risk;
  uint8_t gas1_risk;
  uint8_t gas2_risk;
  uint8_t imu1_x, imu1_y, imu1_z;
  uint8_t imu2_x, imu2_y, imu2_z;
} sensor_data;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println();
  Serial.println("ESP8266 Communication Bridge Starting...");
  
  // Initialize I2C as master
  Wire.begin();  // Default pins: D1(SCL), D2(SDA)
  Wire.setClock(100000); // 100kHz for reliable communication
  
  Serial.println("I2C Master initialized");
  Serial.println("SDA: D2 (GPIO4), SCL: D1 (GPIO5)");
  
  // Initialize WiFi
  initializeWiFi();
  
  // Status LED
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH); // LED off (inverted)
  
  Serial.println("System ready - starting communication...");
}

void loop() {
  // Check WiFi connection
  checkWiFiConnection();
  
  // Check TCP connection
  checkTCPConnection();
  
  // Request sensor data periodically
  if (tcp_connected && millis() - last_sensor_request >= SENSOR_REQUEST_INTERVAL) {
    requestAndSendSensorData();
    last_sensor_request = millis();
  }
  
  // Handle incoming TCP data (motor commands)
  handleTCPData();
  
  // Send heartbeat
  if (tcp_connected && millis() - last_heartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    last_heartbeat = millis();
  }
  
  // Toggle LED to show activity
  static unsigned long last_led_toggle = 0;
  if (millis() - last_led_toggle >= 1000) {
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
    last_led_toggle = millis();
  }
  
  delay(10);
}

void initializeWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  unsigned long start_time = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start_time < 15000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifi_connected = true;
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    if (wifi_connected) {
      Serial.println("WiFi connection lost!");
      wifi_connected = false;
      tcp_connected = false;
      tcpClient.stop();
    }
    
    // Try to reconnect
    if (millis() - last_connection_attempt >= RECONNECT_INTERVAL) {
      Serial.println("Attempting WiFi reconnection...");
      WiFi.begin(ssid, password);
      last_connection_attempt = millis();
    }
  } else if (!wifi_connected) {
    wifi_connected = true;
    Serial.println("WiFi reconnected!");
  }
}

void checkTCPConnection() {
  if (!wifi_connected) return;
  
  if (!tcpClient.connected()) {
    if (tcp_connected) {
      Serial.println("TCP connection lost!");
      tcp_connected = false;
    }
    
    // Try to reconnect
    if (millis() - last_connection_attempt >= RECONNECT_INTERVAL) {
      Serial.print("Connecting to TCP server: ");
      Serial.print(tcp_server_ip);
      Serial.print(":");
      Serial.println(tcp_server_port);
      
      if (tcpClient.connect(tcp_server_ip, tcp_server_port)) {
        Serial.println("TCP connected!");
        
        // Send identification
        tcpClient.println("RP");
        tcp_connected = true;
        
        // Wait for server response
        delay(100);
        if (tcpClient.available()) {
          String response = tcpClient.readStringUntil('\n');
          Serial.println("Server response: " + response);
        }
      } else {
        Serial.println("TCP connection failed!");
      }
      
      last_connection_attempt = millis();
    }
  }
}

void requestAndSendSensorData() {
  // Request sensor data from STM32F401
  if (requestSensorData()) {
    // Send to TCP server
    sendSensorDataToServer();
  }
}

bool requestSensorData() {
  // Send request command to STM32F401
  Wire.beginTransmission(STM32F401_ADDR);
  Wire.write(CMD_REQUEST_SENSORS);
  byte error = Wire.endTransmission();
  
  if (error != 0) {
    Serial.println("Failed to send sensor request to STM32F401");
    return false;
  }
  
  delay(10); // Give STM32 time to prepare data
  
  // Request 10 bytes of sensor data
  Wire.requestFrom(STM32F401_ADDR, 10);
  
  if (Wire.available() >= 10) {
    sensor_data.ultrasonic1_risk = Wire.read();
    sensor_data.ultrasonic2_risk = Wire.read();
    sensor_data.gas1_risk = Wire.read();
    sensor_data.gas2_risk = Wire.read();
    sensor_data.imu1_x = Wire.read();
    sensor_data.imu1_y = Wire.read();
    sensor_data.imu1_z = Wire.read();
    sensor_data.imu2_x = Wire.read();
    sensor_data.imu2_y = Wire.read();
    sensor_data.imu2_z = Wire.read();
    
    Serial.print("Sensor data received: ");
    Serial.print("US[");
    Serial.print(sensor_data.ultrasonic1_risk);
    Serial.print(",");
    Serial.print(sensor_data.ultrasonic2_risk);
    Serial.print("] Gas[");
    Serial.print(sensor_data.gas1_risk);
    Serial.print(",");
    Serial.print(sensor_data.gas2_risk);
    Serial.print("] IMU1[");
    Serial.print(sensor_data.imu1_x);
    Serial.print(",");
    Serial.print(sensor_data.imu1_y);
    Serial.print(",");
    Serial.print(sensor_data.imu1_z);
    Serial.print("] IMU2[");
    Serial.print(sensor_data.imu2_x);
    Serial.print(",");
    Serial.print(sensor_data.imu2_y);
    Serial.print(",");
    Serial.print(sensor_data.imu2_z);
    Serial.println("]");
    
    return true;
  } else {
    Serial.println("Failed to receive sensor data from STM32F401");
    return false;
  }
}

void sendSensorDataToServer() {
  if (!tcp_connected) return;
  
  // Create JSON-like sensor data string
  String sensorPacket = "sensor_data:";
  sensorPacket += String(sensor_data.ultrasonic1_risk) + ",";
  sensorPacket += String(sensor_data.ultrasonic2_risk) + ",";
  sensorPacket += String(sensor_data.gas1_risk) + ",";
  sensorPacket += String(sensor_data.gas2_risk) + ",";
  sensorPacket += String(sensor_data.imu1_x) + ",";
  sensorPacket += String(sensor_data.imu1_y) + ",";
  sensorPacket += String(sensor_data.imu1_z) + ",";
  sensorPacket += String(sensor_data.imu2_x) + ",";
  sensorPacket += String(sensor_data.imu2_y) + ",";
  sensorPacket += String(sensor_data.imu2_z);
  
  tcpClient.println(sensorPacket);
  Serial.println("Sensor data sent to server: " + sensorPacket);
}

void handleTCPData() {
  if (!tcp_connected || !tcpClient.available()) return;
  
  String command = tcpClient.readStringUntil('\n');
  command.trim();
  
  Serial.println("Received from server: " + command);
  
  // Parse motor commands
  if (command.startsWith("motor_ct:")) {
    String motorCmd = command.substring(9); // Remove "motor_ct:"
    uint8_t motorByte = parseMotorCommand(motorCmd);
    
    if (sendMotorCommand(motorByte)) {
      Serial.println("Motor command sent successfully");
    } else {
      Serial.println("Failed to send motor command");
    }
  } else {
    Serial.println("Unknown command received: " + command);
  }
}

uint8_t parseMotorCommand(String cmd) {
  cmd.toLowerCase();
  
  if (cmd == "stop" || cmd == "0") return MOTOR_STOP;
  else if (cmd == "forward" || cmd == "1") return MOTOR_FORWARD;
  else if (cmd == "backward" || cmd == "2") return MOTOR_BACKWARD;
  else if (cmd == "right" || cmd == "3") return MOTOR_RIGHT;
  else if (cmd == "left" || cmd == "4") return MOTOR_LEFT;
  else {
    Serial.println("Unknown motor command: " + cmd);
    return MOTOR_STOP; // Safe default
  }
}

bool sendMotorCommand(uint8_t command) {
  // Send motor command to STM32F103
  Wire.beginTransmission(STM32F103_ADDR);
  Wire.write(command);
  byte error = Wire.endTransmission();
  
  if (error == 0) {
    Serial.print("Motor command sent: 0x");
    Serial.println(command, HEX);
    return true;
  } else {
    Serial.print("Failed to send motor command. I2C error: ");
    Serial.println(error);
    return false;
  }
}

void sendHeartbeat() {
  if (!tcp_connected) return;
  
  tcpClient.println("heartbeat:esp8266_alive");
  Serial.println("Heartbeat sent");
}