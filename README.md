# Smart Parking System with Arduino Uno & 4 Ultrasonic Sensors

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Dashboard-brightgreen?style=for-the-badge&logo=github)](https://prince-tagadiya.github.io/smart-parking-arduino/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/Prince-Tagadiya/smart-parking-arduino)

- 🌐 **Live Deployed Dashboard**: **[https://prince-tagadiya.github.io/smart-parking-arduino/](https://prince-tagadiya.github.io/smart-parking-arduino/)**
- 📦 **GitHub Repository**: **[https://github.com/Prince-Tagadiya/smart-parking-arduino](https://github.com/Prince-Tagadiya/smart-parking-arduino)**

---

## ⚡ Quick Start

### 1. Run the Dashboard
The dashboard server is already running locally at:
👉 **[http://localhost:3000](http://localhost:3000)**

To run it anytime manually in your terminal:
```bash
python3 -m http.server 3000
```
Then open `http://localhost:3000` in Google Chrome or Microsoft Edge.

---

### 2. Connect Arduino to Dashboard (USB)
1. Upload `arduino/smart_parking.ino` using the Arduino IDE.
2. Keep the Arduino plugged in via USB.
3. On the dashboard at `http://localhost:3000`, click **"Connect Arduino (USB)"**.
4. Select your Arduino's serial port (e.g., `/dev/cu.usbmodem...` on Mac or `COMx` on Windows) and click **Connect**.
5. The slots will update in real-time as objects move in front of the ultrasonic sensors!

---

## 🔌 Hardware Wiring Diagram

| Slot | Sensor | VCC | GND | TRIG Pin | ECHO Pin | Threshold |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Slot 1** | HC-SR04 #1 | Breadboard 5V | Breadboard GND | **Pin 2** | **Pin 3** | < 15 cm |
| **Slot 2** | HC-SR04 #2 | Breadboard 5V | Breadboard GND | **Pin 4** | **Pin 5** | < 15 cm |
| **Slot 3** | HC-SR04 #3 | Breadboard 5V | Breadboard GND | **Pin 6** | **Pin 7** | < 15 cm |
| **Slot 4** | HC-SR04 #4 | Breadboard 5V | Breadboard GND | **Pin 8** | **Pin 9** | < 15 cm |

> **Important Power Note:**
> Arduino Uno has only one 5V pin. Connect Arduino **5V** and **GND** to the power rails of a breadboard, then supply 5V and GND to all 4 ultrasonic sensors from the breadboard rails.

---

## 📊 Dashboard Features
- **Visual Slots**:
  - 🟢 **VACANT (Green)**: Open parking bay, live distance measurement (> 15 cm).
  - 🔴 **NOT VACANT / OCCUPIED (Red)**: Parked vehicle graphic, live distance measurement (≤ 15 cm).
- **Direct Web Serial API**: Connects natively to USB serial in Chrome/Edge without any background daemon.
- **Simulation Mode**: Test with distance sliders and quick toggle buttons even without the Arduino connected.
- **Audio Feedback**: Subtle chimes when vehicles enter or leave a spot.
- **Live Serial Terminal**: Inspect raw JSON packets streamed from the Arduino.
