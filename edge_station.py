import json
import time
import random
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from dataclasses import dataclass, asdict

# ==============================================================================
# ACCURATE TAKEOFF BENCHMARK FLIGHT ENDURANCE (IN HOURS)
# ==============================================================================
FLEET_FLIGHT_PROFILES = {
    "TAPAS-01": {
        "engine": "Rotax 914 F Turbocharged",
        "takeoff_avg_endurance_hours": 24.0,  # 24 Hours standard MALE patrol
        "max_cht": 135.0,
        "min_oil": 1.5,
        "nominal_rpm": 5500,
        "cylinders": 4
    },
    "RUSTOM-02": {
        "engine": "Lycoming O-320",
        "takeoff_avg_endurance_hours": 22.0,  # 22 Hours standard loiter
        "max_cht": 240.0,
        "min_oil": 2.0,
        "nominal_rpm": 2700,
        "cylinders": 4
    },
    "NISHANT-03": {
        "engine": "REI AR-731 Rotary/Twin",
        "takeoff_avg_endurance_hours": 4.5,   # 4.5 Hours tactical loiter
        "max_cht": 180.0,
        "min_oil": 1.8,
        "nominal_rpm": 6500,
        "cylinders": 2
    }
}

def compute_accurate_flight_time(uav_id: str, scenario: str):
    profile = FLEET_FLIGHT_PROFILES.get(uav_id)
    if not profile:
        return "0h 0m", 0.0

    # Total nominal flight endurance from takeoff in minutes
    takeoff_baseline_mins = profile["takeoff_avg_endurance_hours"] * 60.0

    # Dynamic Remaining Flight Time based on active case
    if scenario == "normal":
        remaining_mins = takeoff_baseline_mins
    elif scenario == "coolant_leak":
        remaining_mins = 42.0  # ~40 mins emergency glide & throttle de-rate
    elif scenario == "oil_starvation":
        remaining_mins = 18.0  # ~18 mins critical bearing window
    elif scenario == "dual_failure":
        remaining_mins = 5.0   # Critical seizure threshold (<5 mins)
    else:
        remaining_mins = takeoff_baseline_mins

    # Format cleanly for the dashboard display
    hours = int(remaining_mins // 60)
    minutes = int(remaining_mins % 60)
    
    if hours > 0:
        time_display = f"{hours}h {minutes}m"
    else:
        time_display = f"{minutes} mins"

    return time_display, round(remaining_mins, 1)

class DroneTwin:
    def __init__(self, uav_id: str, profile: dict):
        self.uav_id = uav_id
        self.profile = profile
        self.current_state = {}

    def step(self):
        # Generate baseline telemetry with realistic variations
        rpm = int(self.profile["nominal_rpm"] + random.uniform(-40, 40))
        oil = round(random.uniform(2.8, 3.4), 2)
        temps = [round(self.profile["max_cht"] - 15 + random.uniform(-3, 3), 1) for _ in range(self.profile["cylinders"])]

        # Specific behavior profiles for demonstration
        scenario = "normal"
        if self.uav_id == "RUSTOM-02":
            # Scenario: Cylinder 2 gradual thermal stress
            temps[1] = round(self.profile["max_cht"] + 14.5 + random.uniform(-1, 2), 1)
            scenario = "coolant_leak"
        elif self.uav_id == "NISHANT-03":
            # Scenario: Oil drop + dual-cylinder heat build-up
            oil = round(self.profile["min_oil"] - 0.4 + random.uniform(-0.1, 0.1), 2)
            temps = [round(self.profile["max_cht"] + 8 + random.uniform(-1, 1), 1) for _ in temps]
            scenario = "dual_failure"

        # Physics evaluation
        hot_cyls = [i + 1 for i, t in enumerate(temps) if t > self.profile["max_cht"]]
        oil_critical = oil < self.profile["min_oil"]

        time_display, remaining_mins = compute_accurate_flight_time(self.uav_id, scenario)

        if hot_cyls and oil_critical:
            status = "CRITICAL FAILURE"
            action = "EMERGENCY: Max Throttle De-rate & Forced Return-To-Base"
            badge = "danger"
        elif hot_cyls:
            status = "THERMAL WARNING"
            action = f"CAUTION: De-rate throttle by 20% (High CHT on Cyl {hot_cyls})"
            badge = "warning"
        else:
            status = "NOMINAL"
            action = "Flight conditions nominal. Telemetry baseline verified."
            badge = "success"

        self.current_state = {
            "uav_id": self.uav_id,
            "engine": self.profile["engine"],
            "rpm": rpm,
            "cht": temps,
            "oil_press": oil,
            "status": status,
            "badge": badge,
            "rul_minutes": remaining_mins,
            "rul_display": time_display,
            "takeoff_hours": self.profile["takeoff_avg_endurance_hours"],
            "directive": action
        }

# Global fleet state manager
fleet_twins = {uid: DroneTwin(uid, prof) for uid, prof in FLEET_FLIGHT_PROFILES.items()}

def telemetry_engine_loop():
    while True:
        for twin in fleet_twins.values():
            twin.step()
        time.sleep(0.5)  # 2 Hz telemetry tick

# ==========================================
# 2. EMBEDDED DASHBOARD WEB INTERFACE
# ==========================================
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AeroGuard - Fleet Telemetry Console</title>
  <style>
    :root { --bg: #0b0f19; --card: #151d30; --accent: #38bdf8; --text: #e2e8f0; --danger: #ef4444; --warning: #f59e0b; --success: #10b981; }
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); }
    h1 { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 16px 0; letter-spacing: 0.5px; }
    .fleet-tabs { display: flex; gap: 12px; margin-bottom: 24px; }
    .tab-btn { background: var(--card); border: 1px solid #23304d; color: #94a3b8; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .tab-btn.active { border-color: var(--accent); color: #fff; background: #1e293b; }
    .badge { padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge.success { background: rgba(16, 185, 129, 0.2); color: var(--success); }
    .badge.warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
    .badge.danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .card { background: var(--card); border: 1px solid #23304d; border-radius: 10px; padding: 20px; }
    .card-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
    .card-val { font-size: 32px; font-weight: 700; color: #fff; margin-top: 8px; }
    .cyl-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
    .cyl-box { background: #0f172a; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid #1e293b; }
    .directive-card { background: #172033; border-left: 4px solid var(--accent); border-radius: 8px; padding: 16px 20px; margin-top: 10px; }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h1>PROJECT AEROGUARD &bull; MULTI-UAV FLEET TWIN</h1>
    <span style="font-size: 13px; color: #64748b;">OFFLINE EDGE STATION (AIR-GAPPED)</span>
  </div>

  <div class="fleet-tabs" id="tabBar"></div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Engine RPM</div>
      <div class="card-val" id="valRpm">--</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;" id="valEngine">--</div>
    </div>
    <div class="card">
      <div class="card-label">Oil Pressure</div>
      <div class="card-val" id="valOil">-- <span style="font-size: 18px; font-weight: 400;">bar</span></div>
    </div>
    <div class="card">
      <div class="card-label">Predicted RUL (Remaining Useful Life)</div>
      <div class="card-val" style="color: var(--accent);" id="valRul">-- <span style="font-size: 18px; font-weight: 400;">mins</span></div>
    </div>
  </div>

  <div class="card">
    <div class="card-label">Cylinder Head Temperatures (CHT &deg;C)</div>
    <div class="cyl-grid" id="cylContainer"></div>
  </div>

  <div class="directive-card" id="directiveBox">
    <div class="card-label" style="color: var(--accent);">Active Pilot Directive</div>
    <div style="font-size: 15px; font-weight: 600; margin-top: 6px;" id="valDirective">Awaiting live feed...</div>
  </div>

  <script>
    let activeUav = "TAPAS-01";
    let tabsRendered = false;

    async function updateDashboard() {
      try {
        const res = await fetch('/api/fleet');
        const fleet = await res.json();
        
        // Render tabs once, then update dynamic badges
        const tabBar = document.getElementById('tabBar');
        if (!tabsRendered) {
          tabBar.innerHTML = '';
          Object.keys(fleet).forEach(uid => {
            const btn = document.createElement('button');
            btn.id = `tab-${uid}`;
            btn.className = `tab-btn ${uid === activeUav ? 'active' : ''}`;
            btn.onclick = () => { 
              activeUav = uid; 
              document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              updateDashboard(); 
            };
            tabBar.appendChild(btn);
          });
          tabsRendered = true;
        }

        // Update badge states without destroying click handlers
        Object.keys(fleet).forEach(uid => {
          const item = fleet[uid];
          const btn = document.getElementById(`tab-${uid}`);
          if (btn) {
            if (uid === activeUav) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
            btn.innerHTML = `<span>${uid}</span><span class="badge ${item.badge}">${item.status}</span>`;
          }
        });

        // Render active UAV metrics
        const data = fleet[activeUav];
        if (!data) return;

        document.getElementById('valRpm').innerText = data.rpm.toLocaleString();
        document.getElementById('valEngine').innerText = data.engine;
        document.getElementById('valOil').innerHTML = `${data.oil_press} <span style="font-size: 18px; font-weight: 400;">bar</span>`;
        document.getElementById('valRul').innerHTML = `${data.rul_minutes} <span style="font-size: 18px; font-weight: 400;">mins</span>`;
        document.getElementById('valDirective').innerText = data.directive;

        // Render cylinders
        const cylBox = document.getElementById('cylContainer');
        cylBox.innerHTML = '';
        data.cht.forEach((temp, i) => {
          const el = document.createElement('div');
          el.className = 'cyl-box';
          el.innerHTML = `<div style="font-size: 11px; color: #64748b;">CYL ${i + 1}</div><div style="font-size: 20px; font-weight: 700; margin-top: 4px; color: ${temp > 135 ? '#ef4444' : '#fff'}">${temp}&deg;C</div>`;
          cylBox.appendChild(el);
        });
      } catch (err) {
        console.error("Telemetry link lost", err);
      }
    }

    setInterval(updateDashboard, 500);
    updateDashboard();
  </script>
</body>
</html>
"""

# ==========================================
# 3. HTTP SERVER DISPATCHER
# ==========================================
class TelemetryServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/fleet":
            payload = {uid: twin.current_state for uid, twin in fleet_twins.items()}
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode("utf-8"))

    def log_message(self, format, *args):
        pass  # Suppress default console access spam

if __name__ == "__main__":
    t = threading.Thread(target=telemetry_engine_loop, daemon=True)
    t.start()
    server = HTTPServer(("127.0.0.1", 8080), TelemetryServer)
    print("AeroGuard Edge Station live at http://127.0.0.1:8080")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down AeroGuard.")
