/*
 * STM32F103 6-Motor Tank Controller - I2C Slave (Address: 0x12)
 * 
 * Hardware:
 * - 6x Motor drivers (L298N or similar)
 * - I2C connection to ESP8266
 * - Built-in LED for command indication
 * 
 * Motor Configuration:
 * - 3x LEFT SIDE motors (L1, L2, L3)
 * - 3x RIGHT SIDE motors (R1, R2, R3)
 * 
 * Tank Drive Control:
 * - FORWARD: All motors forward
 * - BACKWARD: All motors backward
 * - TURN RIGHT: Left side forward, Right side backward
 * - TURN LEFT: Left side backward, Right side forward
 * - STOP: All motors stop
 * 
 * Commands: 0x00=stop, 0x01=forward, 0x02=backward, 0x03=right, 0x04=left
 * 
 * LED Patterns:
 * - STOP: 1 blink
 * - FORWARD: 2 blinks
 * - BACKWARD: 3 blinks
 * - RIGHT: 4 blinks
 * - LEFT: 5 blinks
 * - UNKNOWN: Rapid blinking (10 blinks)
 */

#include <Wire.h>

// I2C Configuration
#define I2C_SLAVE_ADDR 0x12

// Motor driver pins for 6 motors (3 left + 3 right)
// LEFT SIDE MOTORS
#define MOTOR_L1_PWM   PA0   // Left Motor 1 PWM
#define MOTOR_L1_DIR1  PA1   // Left Motor 1 Direction 1
#define MOTOR_L1_DIR2  PA2   // Left Motor 1 Direction 2
#define MOTOR_L2_PWM   PA3   // Left Motor 2 PWM
#define MOTOR_L2_DIR1  PA4   // Left Motor 2 Direction 1
#define MOTOR_L2_DIR2  PA5   // Left Motor 2 Direction 2
#define MOTOR_L3_PWM   PA6   // Left Motor 3 PWM
#define MOTOR_L3_DIR1  PA7   // Left Motor 3 Direction 1
#define MOTOR_L3_DIR2  PB0   // Left Motor 3 Direction 2

// RIGHT SIDE MOTORS
#define MOTOR_R1_PWM   PB1   // Right Motor 1 PWM
#define MOTOR_R1_DIR1  PB2   // Right Motor 1 Direction 1
#define MOTOR_R1_DIR2  PB10  // Right Motor 1 Direction 2
#define MOTOR_R2_PWM   PB11  // Right Motor 2 PWM
#define MOTOR_R2_DIR1  PB12  // Right Motor 2 Direction 1
#define MOTOR_R2_DIR2  PB13  // Right Motor 2 Direction 2
#define MOTOR_R3_PWM   PB14  // Right Motor 3 PWM
#define MOTOR_R3_DIR1  PB15  // Right Motor 3 Direction 1
#define MOTOR_R3_DIR2  PA8   // Right Motor 3 Direction 2

// Motor command definitions
#define CMD_STOP     0x00
#define CMD_FORWARD  0x01
#define CMD_BACKWARD 0x02
#define CMD_RIGHT    0x03
#define CMD_LEFT     0x04

// Motor speed settings (0-255)
#define MOTOR_SPEED_NORMAL 180
#define MOTOR_SPEED_TURN   150

// Global variables
volatile uint8_t current_command = CMD_STOP;
volatile bool new_command = false;

// LED indicator variables
unsigned long led_timer = 0;
uint8_t led_blink_count = 0;
uint8_t led_pattern = 0;
bool led_state = false;
const unsigned long LED_BLINK_INTERVAL = 200; // 200ms per blink

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("STM32F103 Motor Controller Starting...");
  Serial.println("LED Indicator enabled for motor commands");
  
  // Initialize motor pins
  initializeMotorPins();
  
  // Initialize I2C as slave
  Wire.begin(I2C_SLAVE_ADDR);
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  
  Serial.print("I2C Slave initialized (Address: 0x");
  Serial.print(I2C_SLAVE_ADDR, HEX);
  Serial.println(")");
  Serial.println("Motor controller ready");
  
  // Status LED
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW); // Start with LED off
  
  // LED startup pattern (3 quick blinks)
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(150);
    digitalWrite(LED_BUILTIN, LOW);
    delay(150);
  }
  
  // Stop motors initially
  stopMotors();
  
  Serial.println("LED Patterns:");
  Serial.println("STOP: 1 blink, FORWARD: 2 blinks, BACKWARD: 3 blinks");
  Serial.println("RIGHT: 4 blinks, LEFT: 5 blinks, UNKNOWN: 10 blinks");
}

void loop() {
  // Process new motor commands
  if (new_command) {
    executeMotorCommand(current_command);
    setLEDPattern(current_command); // Set LED pattern based on command
    new_command = false;
  }
  
  // Handle LED indicator patterns
  handleLEDIndicator();
  
  delay(10); // Small delay to prevent CPU overload
}

void initializeMotorPins() {
  // Set all motor pins as outputs - LEFT SIDE MOTORS
  pinMode(MOTOR_L1_PWM, OUTPUT);
  pinMode(MOTOR_L1_DIR1, OUTPUT);
  pinMode(MOTOR_L1_DIR2, OUTPUT);
  pinMode(MOTOR_L2_PWM, OUTPUT);
  pinMode(MOTOR_L2_DIR1, OUTPUT);
  pinMode(MOTOR_L2_DIR2, OUTPUT);
  pinMode(MOTOR_L3_PWM, OUTPUT);
  pinMode(MOTOR_L3_DIR1, OUTPUT);
  pinMode(MOTOR_L3_DIR2, OUTPUT);
  
  // Set all motor pins as outputs - RIGHT SIDE MOTORS
  pinMode(MOTOR_R1_PWM, OUTPUT);
  pinMode(MOTOR_R1_DIR1, OUTPUT);
  pinMode(MOTOR_R1_DIR2, OUTPUT);
  pinMode(MOTOR_R2_PWM, OUTPUT);
  pinMode(MOTOR_R2_DIR1, OUTPUT);
  pinMode(MOTOR_R2_DIR2, OUTPUT);
  pinMode(MOTOR_R3_PWM, OUTPUT);
  pinMode(MOTOR_R3_DIR1, OUTPUT);
  pinMode(MOTOR_R3_DIR2, OUTPUT);
  
  // Initialize all direction pins to LOW
  digitalWrite(MOTOR_L1_DIR1, LOW); digitalWrite(MOTOR_L1_DIR2, LOW);
  digitalWrite(MOTOR_L2_DIR1, LOW); digitalWrite(MOTOR_L2_DIR2, LOW);
  digitalWrite(MOTOR_L3_DIR1, LOW); digitalWrite(MOTOR_L3_DIR2, LOW);
  digitalWrite(MOTOR_R1_DIR1, LOW); digitalWrite(MOTOR_R1_DIR2, LOW);
  digitalWrite(MOTOR_R2_DIR1, LOW); digitalWrite(MOTOR_R2_DIR2, LOW);
  digitalWrite(MOTOR_R3_DIR1, LOW); digitalWrite(MOTOR_R3_DIR2, LOW);
  
  // Initialize all PWM pins to 0
  analogWrite(MOTOR_L1_PWM, 0); analogWrite(MOTOR_L2_PWM, 0); analogWrite(MOTOR_L3_PWM, 0);
  analogWrite(MOTOR_R1_PWM, 0); analogWrite(MOTOR_R2_PWM, 0); analogWrite(MOTOR_R3_PWM, 0);
  
  Serial.println("6-Motor tank drive system initialized");
  Serial.println("Left side: L1, L2, L3 - Right side: R1, R2, R3");
}

void executeMotorCommand(uint8_t command) {
  Serial.print("Executing motor command: 0x");
  Serial.print(command, HEX);
  Serial.print(" (");
  
  switch (command) {
    case CMD_STOP:
      Serial.println("STOP)");
      stopMotors();
      break;
      
    case CMD_FORWARD:
      Serial.println("FORWARD)");
      moveForward();
      break;
      
    case CMD_BACKWARD:
      Serial.println("BACKWARD)");
      moveBackward();
      break;
      
    case CMD_RIGHT:
      Serial.println("RIGHT)");
      turnRight();
      break;
      
    case CMD_LEFT:
      Serial.println("LEFT)");
      turnLeft();
      break;
      
    default:
      Serial.print("UNKNOWN: ");
      Serial.print(command);
      Serial.println(")");
      stopMotors(); // Safe default
      break;
  }
}

void setLEDPattern(uint8_t command) {
  // Set different LED patterns for different commands
  switch (command) {
    case CMD_STOP:
      led_pattern = 1; // 1 blink
      break;
    case CMD_FORWARD:
      led_pattern = 2; // 2 blinks
      break;
    case CMD_BACKWARD:
      led_pattern = 3; // 3 blinks
      break;
    case CMD_RIGHT:
      led_pattern = 4; // 4 blinks
      break;
    case CMD_LEFT:
      led_pattern = 5; // 5 blinks
      break;
    default:
      led_pattern = 10; // Rapid blinking for unknown commands
      break;
  }
  
  led_blink_count = 0;
  led_timer = millis();
  led_state = false;
  digitalWrite(LED_BUILTIN, LOW); // Start with LED off
  
  Serial.print("LED Pattern set: ");
  Serial.print(led_pattern);
  Serial.println(" blinks");
}

void handleLEDIndicator() {
  if (led_pattern == 0) return; // No pattern active
  
  unsigned long current_time = millis();
  
  // Handle blinking timing
  if (current_time - led_timer >= LED_BLINK_INTERVAL) {
    if (!led_state) {
      // Turn LED on
      digitalWrite(LED_BUILTIN, HIGH);
      led_state = true;
      led_timer = current_time;
    } else {
      // Turn LED off
      digitalWrite(LED_BUILTIN, LOW);
      led_state = false;
      led_blink_count++;
      led_timer = current_time;
      
      // Check if pattern is complete
      if (led_blink_count >= led_pattern) {
        led_pattern = 0; // Stop pattern
        led_blink_count = 0;
        Serial.println("LED pattern completed");
      }
    }
  }
}

void stopMotors() {
  // Stop all 6 motors
  digitalWrite(MOTOR_L1_DIR1, LOW); digitalWrite(MOTOR_L1_DIR2, LOW);
  digitalWrite(MOTOR_L2_DIR1, LOW); digitalWrite(MOTOR_L2_DIR2, LOW);
  digitalWrite(MOTOR_L3_DIR1, LOW); digitalWrite(MOTOR_L3_DIR2, LOW);
  digitalWrite(MOTOR_R1_DIR1, LOW); digitalWrite(MOTOR_R1_DIR2, LOW);
  digitalWrite(MOTOR_R2_DIR1, LOW); digitalWrite(MOTOR_R2_DIR2, LOW);
  digitalWrite(MOTOR_R3_DIR1, LOW); digitalWrite(MOTOR_R3_DIR2, LOW);
  
  analogWrite(MOTOR_L1_PWM, 0); analogWrite(MOTOR_L2_PWM, 0); analogWrite(MOTOR_L3_PWM, 0);
  analogWrite(MOTOR_R1_PWM, 0); analogWrite(MOTOR_R2_PWM, 0); analogWrite(MOTOR_R3_PWM, 0);
}

void moveForward() {
  // All motors forward - tank moves forward
  setLeftSideForward();
  setRightSideForward();
}

void moveBackward() {
  // All motors backward - tank moves backward
  setLeftSideBackward();
  setRightSideBackward();
}

void turnRight() {
  // Tank turn right: Left side forward, Right side backward
  setLeftSideForward();
  setRightSideBackward();
}

void turnLeft() {
  // Tank turn left: Left side backward, Right side forward
  setLeftSideBackward();
  setRightSideForward();
}

// Helper functions for tank drive control
void setLeftSideForward() {
  digitalWrite(MOTOR_L1_DIR1, HIGH); digitalWrite(MOTOR_L1_DIR2, LOW);
  digitalWrite(MOTOR_L2_DIR1, HIGH); digitalWrite(MOTOR_L2_DIR2, LOW);
  digitalWrite(MOTOR_L3_DIR1, HIGH); digitalWrite(MOTOR_L3_DIR2, LOW);
  analogWrite(MOTOR_L1_PWM, MOTOR_SPEED_NORMAL);
  analogWrite(MOTOR_L2_PWM, MOTOR_SPEED_NORMAL);
  analogWrite(MOTOR_L3_PWM, MOTOR_SPEED_NORMAL);
}

void setLeftSideBackward() {
  digitalWrite(MOTOR_L1_DIR1, LOW); digitalWrite(MOTOR_L1_DIR2, HIGH);
  digitalWrite(MOTOR_L2_DIR1, LOW); digitalWrite(MOTOR_L2_DIR2, HIGH);
  digitalWrite(MOTOR_L3_DIR1, LOW); digitalWrite(MOTOR_L3_DIR2, HIGH);
  analogWrite(MOTOR_L1_PWM, MOTOR_SPEED_TURN);
  analogWrite(MOTOR_L2_PWM, MOTOR_SPEED_TURN);
  analogWrite(MOTOR_L3_PWM, MOTOR_SPEED_TURN);
}

void setRightSideForward() {
  digitalWrite(MOTOR_R1_DIR1, HIGH); digitalWrite(MOTOR_R1_DIR2, LOW);
  digitalWrite(MOTOR_R2_DIR1, HIGH); digitalWrite(MOTOR_R2_DIR2, LOW);
  digitalWrite(MOTOR_R3_DIR1, HIGH); digitalWrite(MOTOR_R3_DIR2, LOW);
  analogWrite(MOTOR_R1_PWM, MOTOR_SPEED_NORMAL);
  analogWrite(MOTOR_R2_PWM, MOTOR_SPEED_NORMAL);
  analogWrite(MOTOR_R3_PWM, MOTOR_SPEED_NORMAL);
}

void setRightSideBackward() {
  digitalWrite(MOTOR_R1_DIR1, LOW); digitalWrite(MOTOR_R1_DIR2, HIGH);
  digitalWrite(MOTOR_R2_DIR1, LOW); digitalWrite(MOTOR_R2_DIR2, HIGH);
  digitalWrite(MOTOR_R3_DIR1, LOW); digitalWrite(MOTOR_R3_DIR2, HIGH);
  analogWrite(MOTOR_R1_PWM, MOTOR_SPEED_TURN);
  analogWrite(MOTOR_R2_PWM, MOTOR_SPEED_TURN);
  analogWrite(MOTOR_R3_PWM, MOTOR_SPEED_TURN);
}

// I2C receive event (command from ESP8266)
void receiveEvent(int bytes) {
  while (Wire.available()) {
    uint8_t command = Wire.read();
    
    // Validate command
    if (command <= CMD_LEFT) {
      current_command = command;
      new_command = true;
      
      Serial.print("✅ Received valid command: 0x");
      Serial.print(command, HEX);
      Serial.print(" (");
      
      // Print command name for clarity
      switch (command) {
        case CMD_STOP: Serial.println("STOP)"); break;
        case CMD_FORWARD: Serial.println("FORWARD)"); break;
        case CMD_BACKWARD: Serial.println("BACKWARD)"); break;
        case CMD_RIGHT: Serial.println("RIGHT)"); break;
        case CMD_LEFT: Serial.println("LEFT)"); break;
      }
      
    } else {
      Serial.print("❌ Received invalid command: 0x");
      Serial.println(command, HEX);
      // Trigger error LED pattern for invalid commands
      setLEDPattern(0xFF); // Will trigger default case (10 blinks)
    }
  }
}

// I2C request event (ESP8266 requesting status)
void requestEvent() {
  // Send current command as status
  Wire.write(current_command);
  
  Serial.print("Status requested - sent: 0x");
  Serial.println(current_command, HEX);
}