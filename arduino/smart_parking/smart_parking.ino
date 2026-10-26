/*
 * Smart Parking System using Arduino Uno & 4 HC-SR04 Ultrasonic Sensors
 * 
 * Pin Configuration:
 * - Slot 1: TRIG = Pin 2, ECHO = Pin 3
 * - Slot 2: TRIG = Pin 4, ECHO = Pin 5
 * - Slot 3: TRIG = Pin 6, ECHO = Pin 7
 * - Slot 4: TRIG = Pin 8, ECHO = Pin 9
 * - All VCC pins -> Arduino 5V (use breadboard power rail)
 * - All GND pins -> Arduino GND (use breadboard ground rail)
 * 
 * Baud Rate: 9600
 * Output format: JSON string per measurement cycle
 */

// Define sensor pins
const int TRIG_PINS[4] = {2, 4, 6, 8};
const int ECHO_PINS[4] = {3, 5, 7, 9};

// Distance threshold in centimeters:
// If an object is closer than this threshold (< 3.0 cm), the slot is considered OCCUPIED (Not Vacant)
const float OCCUPIED_THRESHOLD_CM = 3.0; 

// Maximum distance HC-SR04 can reliably measure (cm)
const unsigned long MAX_TIMEOUT_US = 25000; // ~400 cm timeout

void setup() {
  // Initialize Serial communication at 9600 baud
  Serial.begin(9600);

  // Set pin modes for all 4 sensors
  for (int i = 0; i < 4; i++) {
    pinMode(TRIG_PINS[i], OUTPUT);
    pinMode(ECHO_PINS[i], INPUT);
    digitalWrite(TRIG_PINS[i], LOW);
  }

  // Brief pause for sensor stabilization
  delay(500);
  Serial.println(F("{\"status\":\"system_ready\",\"slots\":4}"));
}

// Function to measure distance in centimeters for a specific slot (0 to 3)
float measureDistance(int slotIndex) {
  int trigPin = TRIG_PINS[slotIndex];
  int echoPin = ECHO_PINS[slotIndex];

  // Send a 10 microsecond HIGH pulse to trigger
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure pulse duration in microseconds
  unsigned long duration = pulseIn(echoPin, HIGH, MAX_TIMEOUT_US);

  // If timeout or out of range, return a large distance (vacant)
  if (duration == 0) {
    return 999.0;
  }

  // Speed of sound: ~0.0343 cm/us -> distance = (duration * 0.0343) / 2
  float distanceCm = (duration * 0.0343) / 2.0;
  return distanceCm;
}

void loop() {
  float distances[4];
  bool occupied[4];

  // Read each sensor sequentially with a short delay to prevent ultrasonic echo cross-interference
  for (int i = 0; i < 4; i++) {
    distances[i] = measureDistance(i);
    occupied[i] = (distances[i] > 0.0 && distances[i] < OCCUPIED_THRESHOLD_CM);
    delay(40); // 40ms separation between sensors to avoid overlapping echo pulses
  }

  // Output as a clean JSON line over Serial
  Serial.print(F("{\"slot1\":"));
  Serial.print(occupied[0] ? F("true") : F("false"));
  Serial.print(F(",\"slot2\":"));
  Serial.print(occupied[1] ? F("true") : F("false"));
  Serial.print(F(",\"slot3\":"));
  Serial.print(occupied[2] ? F("true") : F("false"));
  Serial.print(F(",\"slot4\":"));
  Serial.print(occupied[3] ? F("true") : F("false"));
  Serial.print(F(",\"d1\":"));
  Serial.print(distances[0], 1);
  Serial.print(F(",\"d2\":"));
  Serial.print(distances[1], 1);
  Serial.print(F(",\"d3\":"));
  Serial.print(distances[2], 1);
  Serial.print(F(",\"d4\":"));
  Serial.print(distances[3], 1);
  Serial.println(F("}"));

  // Cycle rate: updates every ~250ms (~4 Hz refresh rate)
  delay(150);
}
