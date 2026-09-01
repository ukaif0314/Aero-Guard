# Real-Time Digital Twin for MALE UAV Aero Piston Engines
### DRDO Problem Statement SIH26054 | Ground Control Station & Prognostics Engine

---

## 1. Executive Summary & Problem Context

In Medium-Altitude Long-Endurance (**MALE**) Unmanned Aerial Vehicles (e.g., **DRDO TAPAS-BH-201 / Rustom-II**), aero-piston engines (such as the **Rotax 914 Turbocharged / Austro AE300**) operate under extreme thermal, pneumatic, and aerodynamic stress across varying altitudes (8,000 - 25,000 ft).

Traditional threshold-based engine health monitoring cannot distinguish between normal operating transients (e.g., climb power vs cruise) and incipient mechanical or thermodynamic failures. This Digital Twin solves **DRDO SIH26054** by synthesizing:
1. **1D First-Principles Thermodynamic Physics Baseline**: Real-time analytical estimation of theoretical Cylinder Head Temperatures (CHT), Exhaust Gas Temperatures (EGT), Oil Pressure, and Fuel Flow.
2. **Physics Residual Tracking**: Delta analysis (Sensor - Expected) to isolate subtle degradation.
3. **Deep Learning Prognostics (BiLSTM PHM)**: Real-time Remaining Useful Life (**RUL**) in minutes, **Health Index** (0-100%), and multi-class **Failure Mode Classification**.
4. **Autonomous Tactical Flight Advisory Agent**: Actionable pilot/FCS directives, life extension quantification, and technical reasoning traces.
5. **Tactical Military-Grade GCS UI**: High-frequency (5 Hz) live dashboard with telemetry charts, cylinder thermal schematics, and interactive fault testing decks.

---

## 2. System Architecture

```
uav-piston-engine-digital-twin/
├── backend/                               # High-Performance Python PHM Engine
│   ├── .venv/                             # Isolated virtual environment
│   ├── simulator.py                       # 4-cylinder aero-piston engine physics simulator
│   ├── digital_twin.py                    # 1D thermodynamic baseline & BiLSTM neural network
│   ├── advisory.py                        # Autonomous tactical flight advisory & reasoning agent
│   ├── main.py                            # FastAPI hub (REST + 5Hz bi-directional WebSocket)
│   ├── test_backend.py                    # Automated backend test suite
│   └── requirements.txt                   # FastAPI, PyTorch, Scikit-Learn, WebSockets
│
├── frontend/                              # Tactical Ground Control Station (GCS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css                # Military HUD grid background, glowing borders
│   │   │   ├── layout.tsx                 # Root layout with DRDO metadata
│   │   │   └── page.tsx                   # Main GCS dashboard orchestrator & Web Audio synth
│   │   ├── components/
│   │   │   ├── HeaderHUD.tsx              # Flight envelope, drone callout, MET clock
│   │   │   ├── HealthBanner.tsx           # RUL countdown, radial health gauge, PHM mode badge
│   │   │   ├── CylinderThermalGrid.tsx    # 4-cylinder thermal schematic (CHT/EGT vs baseline)
│   │   │   ├── TelemetryCharts.tsx        # Recharts live rolling graphs (30-sample buffer)
│   │   │   ├── AdvisoryTerminal.tsx       # Tactical Action Directives & diagnostic trace log
│   │   │   └── FaultDeck.tsx              # Interactive fault injection & throttle control
│   │   └── types/
│   │       └── telemetry.ts               # Strict TypeScript definitions
│   ├── verify_e2e.mjs                     # Automated browser integration test suite
│   └── package.json                       # Next.js 15, Tailwind CSS, Lucide-React, Recharts
└── README.md                              # Complete system documentation
```

---

## 3. Core Physics & Prognostics Models

### A. 1D First-Principles Thermodynamic Baseline
The physics baseline estimates expected operating points based on Otto cycle thermodynamic relations:
- Theoretical Air Mass Flow: m_air = (V_d * RPM * eta_v * P_manifold) / (2 * R * T_manifold)
- Theoretical CHT: CHT_theo = (T_combustion * alpha_rejection) / (h_coolant * A + h_ram * V_airspeed) + T_ambient
- Theoretical Oil Pressure: P_oil_theo = mu(T_oil) * omega_crank * K_pump

### B. Multi-Dimensional Physics Residuals
- Delta CHT_i = CHT_sensor_i - CHT_theo_i
- Delta EGT_i = EGT_sensor_i - EGT_theo_i
- Delta P_oil = P_oil_sensor - P_oil_theo
- Delta Vib = Vib_sensor - Vib_theo

### C. BiLSTM Deep Learning Prognostics
- **Input**: Sliding temporal buffer (L=15 timesteps, 14 normalized telemetry + residual features).
- **Architecture**: 2-layer Bidirectional LSTM (48 units) + Shared Dense Layer (64 units).
- **Outputs**:
  1. **Health Index (0-100%)**: Continuous structural and operational health metric.
  2. **Remaining Useful Life (RUL)**: Estimated operating minutes remaining before catastrophic failure boundary.
  3. **Multi-Class Classification**: Softmax distribution across `NOMINAL`, `Thermal Overheat`, `Mechanical Friction`, and `Combustion Loss`.

---

## 4. Stateful Fault Injection Scenarios

| Fault Mode | Physical Mechanism | Telemetry Signature | GCS Advisory Directive |
| :--- | :--- | :--- | :--- |
| **NOMINAL** | Baseline engine operation | All parameters within green band; CHT <120°C, Oil P >4.0 bar | `MAINTAIN CURRENT CRUISE PROFILE` |
| **COOLANT LEAK** | Coolant fluid depletion; loss of convective heat dissipation | Exponential CHT runaway (>135°C on Cyl 2 & 3), rising oil temperature | `DE-RATE THROTTLE TO 55% & INCREASE AIRSPEED TO 95 KTS FOR RAM AIR COOLING` |
| **OIL STARVATION** | Oil pump failure or oil line rupture; loss of hydrodynamic film | Oil pressure collapses (<1.2 bar), bearing friction surges, vibration RMS >10g | `IMMEDIATE EMERGENCY RTB: TRIM THROTTLE TO 30% IDLE DESCENT & COMMENCE GLIDE` |
| **CYLINDER 3 MISFIRE** | Loss of spark/injector in Cylinder 3; unburned cold gas | EGT3 collapses (<400°C), high EGT spread (>300°C), 1-order torque ripple vibration | `EXECUTE IGNITION DUAL-CHANNEL RESET, SET THROTTLE TO 55% VIBRATION MINIMUM` |

---

## 5. Quickstart Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node.js v24 LTS)

### Step 1: Launch Backend
```bash
cd backend
.\.venv\Scripts\activate      # On Windows (or source .venv/bin/activate on Linux)
python main.py
```
*Backend runs on `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`).*

### Step 2: Launch Frontend (Ground Control Station)
```bash
cd frontend
npm run dev                    # or npm run build && npm run start
```
*GCS Dashboard opens on `http://localhost:3000`.*

### Step 3: Run Automated Verification Suite
```bash
# Verify Backend API & WebSocket:
python backend/test_backend.py

# Verify End-to-End Browser Automation:
cd frontend
node verify_e2e.mjs
```

---

## 6. API Reference

- `GET /api/health` — Subsystem health status
- `GET /api/status` — Instant snapshot of engine telemetry, physics baseline, and advisory
- `POST /api/fault/inject` — Inject fault (`{"fault_type": "COOLANT_LEAK" | "OIL_STARVATION" | "CYLINDER_MISFIRE" | "NONE", "severity": 1.2}`)
- `POST /api/fault/clear` — Clear active fault and recover towards nominal baseline
- `POST /api/throttle` — Set target throttle percentage (`{"throttle_pct": 75.0}`)
- `POST /api/reset` — Reset engine simulation and digital twin states
- `WS /ws/telemetry` — High-frequency bi-directional WebSocket stream (5 Hz)
