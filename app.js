// Smart Parking Dashboard Application

// System State
const STATE = {
  isSerialConnected: false,
  isSimulating: true,
  thresholdCm: 15.0,
  slots: [
    { id: 1, occupied: false, distance: 85.0 },
    { id: 2, occupied: false, distance: 92.0 },
    { id: 3, occupied: false, distance: 104.0 },
    { id: 4, occupied: false, distance: 78.0 }
  ]
};

// Web Serial variables
let serialPort = null;
let serialReader = null;
let serialKeepReading = true;

// DOM Elements
const connectionPill = document.getElementById('connectionPill');
const connectionText = document.getElementById('connectionText');
const btnConnectSerial = document.getElementById('btnConnectSerial');
const btnToggleSim = document.getElementById('btnToggleSim');
const simBtnText = document.getElementById('simBtnText');

const statVacant = document.getElementById('statVacant');
const statOccupied = document.getElementById('statOccupied');
const statRate = document.getElementById('statRate');
const progressCircle = document.getElementById('progressCircle');

const serialLog = document.getElementById('serialLog');
const btnClearLog = document.getElementById('btnClearLog');

// Audio chime using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playChime(isOccupied) {
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (isOccupied) {
      // Car parked - slightly lower alert chime
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.15); // E4
    } else {
      // Car left - bright cheerful chime
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
    }

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    // Audio context may be restricted by autoplay policy until user gesture
  }
}

// Update single slot in DOM
function updateSlotUI(index, isOccupied, distance) {
  const slotNum = index + 1;
  const card = document.getElementById(`slot-card-${slotNum}`);
  const badge = document.getElementById(`badge-${slotNum}`);
  const distEl = document.getElementById(`dist-${slotNum}`);
  const slider = document.getElementById(`simSlider${slotNum}`);
  const simVal = document.getElementById(`simVal${slotNum}`);

  const previousOccupied = STATE.slots[index].occupied;
  STATE.slots[index].occupied = isOccupied;
  STATE.slots[index].distance = distance;

  // Sound cue on transition
  if (previousOccupied !== isOccupied) {
    playChime(isOccupied);
  }

  // Visual state update
  if (isOccupied) {
    card.classList.remove('vacant');
    card.classList.add('occupied');
    badge.className = 'status-badge red';
    badge.textContent = 'NOT VACANT';
  } else {
    card.classList.remove('occupied');
    card.classList.add('vacant');
    badge.className = 'status-badge green';
    badge.textContent = 'VACANT';
  }

  const distText = (distance > 200 || distance <= 0) ? '> 200 cm' : `${distance.toFixed(1)} cm`;
  distEl.textContent = distText;

  // Keep slider aligned if in sim mode
  if (slider && simVal) {
    slider.value = Math.min(150, Math.max(2, Math.round(distance)));
    simVal.textContent = `${Math.round(distance)} cm`;
  }

  updateGlobalStats();
}

// Recalculate and update top statistics
function updateGlobalStats() {
  const total = STATE.slots.length;
  const occupiedCount = STATE.slots.filter(s => s.occupied).length;
  const vacantCount = total - occupiedCount;
  const occupancyPercent = Math.round((occupiedCount / total) * 100);

  statVacant.textContent = vacantCount;
  statOccupied.textContent = occupiedCount;
  statRate.textContent = `${occupancyPercent}%`;

  // Update circular chart stroke dasharray (format: "value, 100")
  if (progressCircle) {
    progressCircle.setAttribute('stroke-dasharray', `${occupancyPercent}, 100`);
    if (occupancyPercent >= 75) {
      progressCircle.setAttribute('stroke', '#ef4444');
    } else if (occupancyPercent >= 50) {
      progressCircle.setAttribute('stroke', '#f59e0b');
    } else {
      progressCircle.setAttribute('stroke', '#10b981');
    }
  }
}

// Log line to terminal box
function logToTerminal(message, isRaw = false) {
  const line = document.createElement('div');
  line.className = 'log-line';
  const time = new Date().toLocaleTimeString();
  line.textContent = isRaw ? `[${time}] ${message}` : message;

  serialLog.appendChild(line);
  // Auto scroll to bottom
  serialLog.scrollTop = serialLog.scrollHeight;

  // Limit terminal history
  while (serialLog.children.length > 50) {
    serialLog.removeChild(serialLog.firstChild);
  }
}

// Clear log button
btnClearLog.addEventListener('click', () => {
  serialLog.innerHTML = '<div class="log-line text-muted">[Terminal cleared]</div>';
});

// Toggle simulation mode
btnToggleSim.addEventListener('click', () => {
  STATE.isSimulating = !STATE.isSimulating;
  if (STATE.isSimulating) {
    btnToggleSim.classList.add('active-mode');
    simBtnText.textContent = 'Simulation: ON';
    if (!STATE.isSerialConnected) {
      connectionPill.className = 'connection-status-pill simulating';
      connectionText.textContent = 'Simulating Mode';
    }
    logToTerminal('[System] Simulation mode enabled. Use sliders or click slots to test.');
  } else {
    btnToggleSim.classList.remove('active-mode');
    simBtnText.textContent = 'Simulation: OFF';
    if (!STATE.isSerialConnected) {
      connectionPill.className = 'connection-status-pill';
      connectionText.textContent = 'Disconnected';
    }
    logToTerminal('[System] Simulation mode turned off.');
  }
});

// Manual click toggle on a slot
window.toggleSlotOccupancy = function(slotIndex) {
  const current = STATE.slots[slotIndex].occupied;
  const newOccupied = !current;
  const newDist = newOccupied ? 8.0 : 85.0; // below or above 15cm threshold
  updateSlotUI(slotIndex, newOccupied, newDist);
  logToTerminal(`[Sim] Slot ${slotIndex + 1} manually set to: ${newOccupied ? 'OCCUPIED (8.0 cm)' : 'VACANT (85.0 cm)'}`);
};

// Slider change handler
window.onSliderChange = function(slotIndex, val) {
  const dist = parseFloat(val);
  const isOccupied = (dist <= STATE.thresholdCm && dist > 0);
  updateSlotUI(slotIndex, isOccupied, dist);
};

// ==================== WEB SERIAL API INTEGRATION ====================
btnConnectSerial.addEventListener('click', async () => {
  if (!("serial" in navigator)) {
    alert("Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera.");
    return;
  }

  if (STATE.isSerialConnected) {
    // Disconnect
    disconnectSerial();
    return;
  }

  try {
    // Request serial port from user
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 9600 });

    STATE.isSerialConnected = true;
    STATE.isSimulating = false;
    btnToggleSim.classList.remove('active-mode');
    simBtnText.textContent = 'Simulation: OFF';

    btnConnectSerial.textContent = 'Disconnect USB';
    btnConnectSerial.classList.remove('btn-primary');
    btnConnectSerial.classList.add('btn-secondary');

    connectionPill.className = 'connection-status-pill connected';
    connectionText.textContent = 'Arduino Connected (9600 baud)';

    logToTerminal('[Serial] Successfully connected to Arduino Uno!');
    readSerialLoop();
  } catch (err) {
    console.error('Serial connection error:', err);
    logToTerminal(`[Serial Error] ${err.message || 'Connection cancelled'}`);
  }
});

async function disconnectSerial() {
  serialKeepReading = false;
  if (serialReader) {
    try {
      await serialReader.cancel();
    } catch (e) {}
  }
  if (serialPort) {
    try {
      await serialPort.close();
    } catch (e) {}
  }

  STATE.isSerialConnected = false;
  btnConnectSerial.textContent = 'Connect Arduino (USB)';
  btnConnectSerial.classList.remove('btn-secondary');
  btnConnectSerial.classList.add('btn-primary');

  connectionPill.className = 'connection-status-pill';
  connectionText.textContent = 'Disconnected';
  logToTerminal('[Serial] Disconnected.');
}

async function readSerialLoop() {
  serialKeepReading = true;
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
  const reader = textDecoder.readable.getReader();
  serialReader = reader;

  let buffer = '';

  try {
    while (serialKeepReading) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        buffer += value;
        const lines = buffer.split('\n');
        // Keep the last incomplete fragment in the buffer
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            handleSerialLine(trimmed);
          }
        }
      }
    }
  } catch (error) {
    if (serialKeepReading) {
      logToTerminal(`[Serial Error] ${error.message}`);
    }
  } finally {
    reader.releaseLock();
  }
}

// Process incoming line from Arduino
function handleSerialLine(line) {
  logToTerminal(line, true);

  // Expecting JSON: {"slot1":false,"slot2":true,"slot3":false,"slot4":false,"d1":85.4,"d2":8.1,"d3":104.5,"d4":78.1}
  if (line.startsWith('{') && line.endsWith('}')) {
    try {
      const data = JSON.parse(line);

      // Slot 1
      if (data.slot1 !== undefined && data.d1 !== undefined) {
        updateSlotUI(0, data.slot1, parseFloat(data.d1));
      }
      // Slot 2
      if (data.slot2 !== undefined && data.d2 !== undefined) {
        updateSlotUI(1, data.slot2, parseFloat(data.d2));
      }
      // Slot 3
      if (data.slot3 !== undefined && data.d3 !== undefined) {
        updateSlotUI(2, data.slot3, parseFloat(data.d3));
      }
      // Slot 4
      if (data.slot4 !== undefined && data.d4 !== undefined) {
        updateSlotUI(3, data.slot4, parseFloat(data.d4));
      }
    } catch (e) {
      // Incomplete or non-JSON serial message (e.g. system bootup message)
    }
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  connectionPill.className = 'connection-status-pill simulating';
  connectionText.textContent = 'Simulating Mode';

  // Initial render of all 4 slots
  STATE.slots.forEach((s, idx) => {
    updateSlotUI(idx, s.occupied, s.distance);
  });

  logToTerminal('[Dashboard] Ready. Click on any parking slot or use sliders to test vacancy.');
});
