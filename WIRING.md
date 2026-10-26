# Hardware Connection & Circuit Guide

## Components Required
1. 1x Arduino Uno (or compatible clone)
2. 4x HC-SR04 Ultrasonic Distance Sensors
3. 1x Solderless Breadboard
4. Jumper Wires (Male-to-Male and Male-to-Female)
5. 1x USB Cable (Type-A to Type-B) to connect Arduino Uno to your computer

---

## Pinout Mapping Table

```
                  ARDUINO UNO
                 +-----------+
                 |    5V     |-----> Breadboard (+) Red Rail
                 |    GND    |-----> Breadboard (-) Blue/Black Rail
                 |           |
HC-SR04 #1 TRIG  |   Pin 2   |
HC-SR04 #1 ECHO  |   Pin 3   |
HC-SR04 #2 TRIG  |   Pin 4   |
HC-SR04 #2 ECHO  |   Pin 5   |
HC-SR04 #3 TRIG  |   Pin 6   |
HC-SR04 #3 ECHO  |   Pin 7   |
HC-SR04 #4 TRIG  |   Pin 8   |
HC-SR04 #4 ECHO  |   Pin 9   |
                 +-----------+
```

### Detailed Sensor Connections:

#### Sensor 1 (Slot 01):
- `VCC`  --> Breadboard `+5V`
- `GND`  --> Breadboard `GND`
- `TRIG` --> Arduino Digital **Pin 2**
- `ECHO` --> Arduino Digital **Pin 3**

#### Sensor 2 (Slot 02):
- `VCC`  --> Breadboard `+5V`
- `GND`  --> Breadboard `GND`
- `TRIG` --> Arduino Digital **Pin 4**
- `ECHO` --> Arduino Digital **Pin 5**

#### Sensor 3 (Slot 03):
- `VCC`  --> Breadboard `+5V`
- `GND`  --> Breadboard `GND`
- `TRIG` --> Arduino Digital **Pin 6**
- `ECHO` --> Arduino Digital **Pin 7**

#### Sensor 4 (Slot 04):
- `VCC`  --> Breadboard `+5V`
- `GND`  --> Breadboard `GND`
- `TRIG` --> Arduino Digital **Pin 8**
- `ECHO` --> Arduino Digital **Pin 9**

---

## Wiring Breadboard Distribution Tips:
1. Connect the Arduino **5V** pin to the **(+) power bus** of your breadboard.
2. Connect the Arduino **GND** pin to the **(-) ground bus** of your breadboard.
3. Plug each sensor's VCC and GND wires into those shared breadboard buses.
4. Keep the trigger and echo wire pairs grouped together with each sensor to prevent mixing them up.
5. Point each sensor into its respective parking slot (e.g. from the wall or ceiling pointing down/forward at bumper height).
