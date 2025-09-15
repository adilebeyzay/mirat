/*
 * STM32F401 Sensor Collector - I2C Slave (Address: 0x10)
 * 
 * Hardware:
 * - 2x Ultrasonic sensors (HC-SR04 or similar)
 * - 2x Gas sensors (MQ series)
 * - 2x IMU sensors (MPU6050 or similar) on same I2C bus
 * - Hardware I2C for ESP8266 communication (default pins)
 * 
 * Function: Collect sensor data and send to ESP8266 via I2C
 * Risk values: 1-3 for each sensor (1=safe, 2=warning, 3=danger)
 * IMU values: 0-255 raw data (128=0g, <128=negative, >128=positive)
 * 
 * Note: All I2C devices share the same bus with different addresses
 * Uses mode switching between master (for IMU) and slave (for ESP8266)
 */

#include <Wire.h>

// I2C Configuration
#define I2C_SLAVE_ADDR 0x10

// Command codes from ESP8266
#define CMD_REQUEST_SENSORS 0x01
#define CMD_STATUS 0x02

// Ultrasonic sensor pins
#define ULTRASONIC1_TRIG PA0
#define ULTRASONIC1_ECHO PA1
#define ULTRASONIC2_TRIG PA2
#define ULTRASONIC2_ECHO PA3

// Gas sensor pins (analog)
#define GAS_SENSOR1 PA4
#define GAS_SENSOR2 PA5

// IMU sensors on same I2C bus
#define IMU1_ADDR 0x68  // MPU6050 default address
#define IMU2_ADDR 0x69  // MPU6050 with AD0 high

// Sensor data structure
struct SensorData {
  uint8_t ultrasonic1_risk;    // Risk level 1-3
  uint8_t ultrasonic2_risk;    // Risk level 1-3
  uint8_t gas1_risk;           // Risk level 1-3
  uint8_t gas2_risk;           // Risk level 1-3
  uint8_t imu1_x, imu1_y, imu1_z;  // IMU1 raw data 0-255
  uint8_t imu2_x, imu2_y, imu2_z;  // IMU2 raw data 0-255
} sensor_data;

// Global variables
volatile bool data_requested = false;
volatile bool i2c_master_mode = true;  // Flag to switch between master/slave
unsigned long last_sensor_read = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 100; // 100ms update rate

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("STM32F401 Sensor Collector Starting...");
  
  // Initialize sensor pins
  initializeSensorPins();
  
  // Start in master mode to initialize IMU sensors
  Wire.begin();
  Wire.setClock(100000); // 100kHz for reliable communication
  
  // Initialize IMU sensors
  initializeIMUSensors();
  
  // Switch to slave mode for ESP8266 communication
  switchToSlaveMode();
  
  Serial.println("I2C Slave initialized (Address: 0x10)");
  Serial.println("System ready - collecting sensor data...");
  
  // Status LED
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  
  // Initial sensor reading
  readAllSensors();
}

void loop() {
  // Update sensors periodically
  if (millis() - last_sensor_read >= SENSOR_UPDATE_INTERVAL) {
    // Temporarily switch to master mode for sensor reading
    if (!i2c_master_mode) {
      switchToMasterMode();
    }
    
    readAllSensors();
    last_sensor_read = millis();
    
    // Switch back to slave mode
    if (i2c_master_mode) {
      switchToSlaveMode();
    }
    
    // Blink LED to show activity
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }
  
  delay(10); // Small delay to prevent CPU overload
}

void switchToMasterMode() {
  Wire.end();
  Wire.begin();
  Wire.setClock(100000);
  i2c_master_mode = true;
}

void switchToSlaveMode() {
  Wire.end();
  Wire.begin(I2C_SLAVE_ADDR);
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  i2c_master_mode = false;
}

void initializeSensorPins() {
  // Ultrasonic sensors
  pinMode(ULTRASONIC1_TRIG, OUTPUT);
  pinMode(ULTRASONIC1_ECHO, INPUT);
  pinMode(ULTRASONIC2_TRIG, OUTPUT);
  pinMode(ULTRASONIC2_ECHO, INPUT);
  
  digitalWrite(ULTRASONIC1_TRIG, LOW);
  digitalWrite(ULTRASONIC2_TRIG, LOW);
  
  // Gas sensors (analog pins are input by default)
  Serial.println("Sensor pins initialized");
}

void initializeIMUSensors() {
  // Initialize IMU1
  Wire.beginTransmission(IMU1_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up IMU
  byte error1 = Wire.endTransmission();
  
  if (error1 == 0) {
    Serial.println("IMU1 (0x68) initialized successfully");
  } else {
    Serial.println("IMU1 initialization failed");
  }
  
  delay(10);
  
  // Initialize IMU2
  Wire.beginTransmission(IMU2_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up IMU
  byte error2 = Wire.endTransmission();
  
  if (error2 == 0) {
    Serial.println("IMU2 (0x69) initialized successfully");
  } else {
    Serial.println("IMU2 initialization failed");
  }
}

void readAllSensors() {
  // Read ultrasonic sensors (non-I2C)
  sensor_data.ultrasonic1_risk = readUltrasonicRisk(ULTRASONIC1_TRIG, ULTRASONIC1_ECHO);
  sensor_data.ultrasonic2_risk = readUltrasonicRisk(ULTRASONIC2_TRIG, ULTRASONIC2_ECHO);
  
  // Read gas sensors (non-I2C)
  sensor_data.gas1_risk = readGasRisk(GAS_SENSOR1);
  sensor_data.gas2_risk = readGasRisk(GAS_SENSOR2);
  
  // Read IMU sensors (I2C) - only if in master mode
  if (i2c_master_mode) {
    readIMURisk(IMU1_ADDR, sensor_data.imu1_x, sensor_data.imu1_y, sensor_data.imu1_z);
    delay(5);
    readIMURisk(IMU2_ADDR, sensor_data.imu2_x, sensor_data.imu2_y, sensor_data.imu2_z);
  }
  
  // Debug output (every 1 second)
  static unsigned long last_debug = 0;
  if (millis() - last_debug >= 1000) {
    Serial.print("Sensors - US1:");
    Serial.print(sensor_data.ultrasonic1_risk);
    Serial.print(" US2:");
    Serial.print(sensor_data.ultrasonic2_risk);
    Serial.print(" Gas1:");
    Serial.print(sensor_data.gas1_risk);
    Serial.print(" Gas2:");
    Serial.print(sensor_data.gas2_risk);
    Serial.print(" IMU1_raw:[");
    Serial.print(sensor_data.imu1_x);
    Serial.print(",");
    Serial.print(sensor_data.imu1_y);
    Serial.print(",");
    Serial.print(sensor_data.imu1_z);
    Serial.print("] IMU2_raw:[");
    Serial.print(sensor_data.imu2_x);
    Serial.print(",");
    Serial.print(sensor_data.imu2_y);
    Serial.print(",");
    Serial.print(sensor_data.imu2_z);
    Serial.print("] Mode:");
    Serial.println(i2c_master_mode ? "Master" : "Slave");
    last_debug = millis();
  }
}

uint8_t readUltrasonicRisk(int trigPin, int echoPin) {
  // Send trigger pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read echo pulse
  unsigned long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    return 3; // No reading = danger
  }
  
  // Calculate distance in cm
  float distance = (duration * 0.034) / 2;
  
  // Convert to risk level
  if (distance > 50) return 1;      // Safe
  else if (distance > 20) return 2; // Warning
  else return 3;                    // Danger
}

uint8_t readGasRisk(int gasPin) {
  int gasValue = analogRead(gasPin);
  
  // Convert analog reading to risk level
  // Adjust thresholds based on your gas sensor specifications
  if (gasValue < 300) return 1;      // Safe
  else if (gasValue < 600) return 2; // Warning
  else return 3;                     // Danger
}

void readIMURisk(uint8_t imuAddr, uint8_t &x_raw, uint8_t &y_raw, uint8_t &z_raw) {
  int16_t accel_x, accel_y, accel_z;
  
  // Read accelerometer data
  Wire.beginTransmission(imuAddr);
  Wire.write(0x3B); // ACCEL_XOUT_H register
  byte error = Wire.endTransmission(false);
  
  if (error != 0) {
    // IMU read error - return mid-range values
    x_raw = y_raw = z_raw = 128;
    return;
  }
  
  Wire.requestFrom(imuAddr, (uint8_t)6);
  if (Wire.available() >= 6) {
    accel_x = (Wire.read() << 8) | Wire.read();
    accel_y = (Wire.read() << 8) | Wire.read();
    accel_z = (Wire.read() << 8) | Wire.read();
  } else {
    x_raw = y_raw = z_raw = 128;
    return;
  }
  
  // Convert raw accelerometer data to 0-255 range
  // MPU6050 range is typically ±2g = ±16384 LSB
  // Map from -16384 to +16384 → 0 to 255
  x_raw = map(constrain(accel_x, -16384, 16384), -16384, 16384, 0, 255);
  y_raw = map(constrain(accel_y, -16384, 16384), -16384, 16384, 0, 255);
  z_raw = map(constrain(accel_z, -16384, 16384), -16384, 16384, 0, 255);
}

// Convert raw accelerometer data to 0-255 range
// This function is no longer needed as we now map directly in readIMURisk()
// Keeping comment for reference: 128 = 0g, <128 = negative acceleration, >128 = positive acceleration

// I2C receive event (command from ESP8266)
void receiveEvent(int bytes) {
  while (Wire.available()) {
    uint8_t command = Wire.read();
    
    switch (command) {
      case CMD_REQUEST_SENSORS:
        data_requested = true;
        Serial.println("Sensor data requested by ESP8266");
        break;
        
      case CMD_STATUS:
        // Status request - no action needed
        break;
        
      default:
        Serial.print("Unknown command: 0x");
        Serial.println(command, HEX);
        break;
    }
  }
}

// I2C request event (ESP8266 requesting data)
void requestEvent() {
  if (data_requested) {
    // Send all sensor data (10 bytes total)
    uint8_t data[10];
    
    // Copy sensor data safely
    noInterrupts();
    data[0] = sensor_data.ultrasonic1_risk;
    data[1] = sensor_data.ultrasonic2_risk;
    data[2] = sensor_data.gas1_risk;
    data[3] = sensor_data.gas2_risk;
    data[4] = sensor_data.imu1_x;
    data[5] = sensor_data.imu1_y;
    data[6] = sensor_data.imu1_z;
    data[7] = sensor_data.imu2_x;
    data[8] = sensor_data.imu2_y;
    data[9] = sensor_data.imu2_z;
    interrupts();
    
    Wire.write(data, 10);
    data_requested = false;
    
    Serial.println("Sensor data sent to ESP8266");
  } else {
    // Send status byte
    Wire.write(0xAA); // Ready status
  }
}