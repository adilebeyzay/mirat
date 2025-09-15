/*
 * STM32F401 Simple Sensor Collector - I2C Slave (Address: 0x10)
 * 
 * Simplified version that uses only one I2C bus for all communication
 * IMU sensors use addresses 0x68 and 0x69
 * ESP8266 communicates as master to this slave at 0x10
 * 
 * This version switches between master mode (to read IMU) and slave mode (for ESP8266)
 */

#include <Wire.h>

#define I2C_SLAVE_ADDR 0x10
#define CMD_REQUEST_SENSORS 0x01
#define CMD_STATUS 0x02

// Pin definitions
#define ULTRASONIC1_TRIG PA0
#define ULTRASONIC1_ECHO PA1
#define ULTRASONIC2_TRIG PA2
#define ULTRASONIC2_ECHO PA3
#define GAS_SENSOR1 PA4
#define GAS_SENSOR2 PA5
#define IMU1_ADDR 0x68
#define IMU2_ADDR 0x69

// Sensor data
struct {
  uint8_t us1_risk, us2_risk;
  uint8_t gas1_risk, gas2_risk;
  uint8_t imu1_x, imu1_y, imu1_z;
  uint8_t imu2_x, imu2_y, imu2_z;
} sensor_data;

volatile bool data_requested = false;
bool is_slave_mode = false;

void setup() {
  Serial.begin(115200);
  Serial.println("STM32F401 Simple Sensor Collector");
  
  // Initialize pins
  pinMode(ULTRASONIC1_TRIG, OUTPUT);
  pinMode(ULTRASONIC1_ECHO, INPUT);
  pinMode(ULTRASONIC2_TRIG, OUTPUT);
  pinMode(ULTRASONIC2_ECHO, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  
  digitalWrite(ULTRASONIC1_TRIG, LOW);
  digitalWrite(ULTRASONIC2_TRIG, LOW);
  
  // Start in master mode
  Wire.begin();
  initIMU();
  
  // Switch to slave mode
  enterSlaveMode();
  
  Serial.println("Ready");
}

void loop() {
  static unsigned long last_read = 0;
  
  if (millis() - last_read > 100) {
    // Temporarily enter master mode to read sensors
    if (is_slave_mode) enterMasterMode();
    
    readSensors();
    
    // Return to slave mode
    if (!is_slave_mode) enterSlaveMode();
    
    last_read = millis();
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }
  
  delay(10);
}

void enterMasterMode() {
  Wire.end();
  Wire.begin();
  is_slave_mode = false;
}

void enterSlaveMode() {
  Wire.end();
  Wire.begin(I2C_SLAVE_ADDR);
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  is_slave_mode = true;
}

void initIMU() {
  // Wake up IMU1
  Wire.beginTransmission(IMU1_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission();
  
  // Wake up IMU2
  Wire.beginTransmission(IMU2_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission();
  
  Serial.println("IMU initialized");
}

void readSensors() {
  // Read ultrasonic sensors
  sensor_data.us1_risk = readUltrasonic(ULTRASONIC1_TRIG, ULTRASONIC1_ECHO);
  sensor_data.us2_risk = readUltrasonic(ULTRASONIC2_TRIG, ULTRASONIC2_ECHO);
  
  // Read gas sensors
  sensor_data.gas1_risk = readGas(GAS_SENSOR1);
  sensor_data.gas2_risk = readGas(GAS_SENSOR2);
  
  // Read IMU sensors
  readIMU(IMU1_ADDR, sensor_data.imu1_x, sensor_data.imu1_y, sensor_data.imu1_z);
  readIMU(IMU2_ADDR, sensor_data.imu2_x, sensor_data.imu2_y, sensor_data.imu2_z);
}

uint8_t readUltrasonic(int trig, int echo) {
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  
  unsigned long duration = pulseIn(echo, HIGH, 30000);
  if (duration == 0) return 3;
  
  float distance = duration * 0.034 / 2;
  if (distance > 50) return 1;
  if (distance > 20) return 2;
  return 3;
}

uint8_t readGas(int pin) {
  int value = analogRead(pin);
  if (value < 300) return 1;
  if (value < 600) return 2;
  return 3;
}

void readIMU(uint8_t addr, uint8_t &x, uint8_t &y, uint8_t &z) {
  Wire.beginTransmission(addr);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) {
    x = y = z = 3;
    return;
  }
  
  Wire.requestFrom(addr, (uint8_t)6);
  if (Wire.available() >= 6) {
    int16_t ax = (Wire.read() << 8) | Wire.read();
    int16_t ay = (Wire.read() << 8) | Wire.read();
    int16_t az = (Wire.read() << 8) | Wire.read();
    
    x = calcRisk(ax);
    y = calcRisk(ay);
    z = calcRisk(az);
  } else {
    x = y = z = 3;
  }
}

uint8_t calcRisk(int16_t accel) {
  float g = abs(accel) / 16384.0;
  if (g < 0.5) return 1;
  if (g < 1.0) return 2;
  return 3;
}

void receiveEvent(int bytes) {
  while (Wire.available()) {
    uint8_t cmd = Wire.read();
    if (cmd == CMD_REQUEST_SENSORS) {
      data_requested = true;
    }
  }
}

void requestEvent() {
  if (data_requested) {
    uint8_t data[9] = {
      sensor_data.us1_risk, sensor_data.us2_risk,
      sensor_data.gas1_risk, sensor_data.gas2_risk,
      sensor_data.imu1_x, sensor_data.imu1_y, sensor_data.imu1_z,
      sensor_data.imu2_x, sensor_data.imu2_y
    };
    Wire.write(data, 9);
    data_requested = false;
  } else {
    Wire.write(0xAA);
  }
}