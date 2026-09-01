# -*- coding: utf-8 -*-
"""
DRDO SIH26054: Backend Verification Test Suite
Tests REST endpoints, WebSocket telemetry streaming at 5Hz,
and fault injection scenarios (COOLANT_LEAK, OIL_STARVATION, CYLINDER_MISFIRE).
"""

import time
import json
import urllib.request
import urllib.error
import asyncio
import websockets


BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws/telemetry"


def http_get(endpoint: str) -> dict:
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers={"User-Agent": "BackendTest/1.0"})
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


def http_post(endpoint: str, payload: dict) -> dict:
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "BackendTest/1.0"}
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


async def test_websocket_stream():
    print("\n--- 1. Testing WebSocket Telemetry Stream (5Hz) ---")
    async with websockets.connect(WS_URL) as ws:
        frames_received = []
        for i in range(5):
            msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
            data = json.loads(msg)
            frames_received.append(data)
            print(f"  [Frame {i+1}] FlightTime: {data['flight_time_s']}s | RPM: {data['telemetry']['rpm']} | CHT Max: {data['telemetry']['cht_max']}C | EGT Avg: {data['telemetry']['egt_avg']}C | Health: {data['digital_twin']['health_index_pct']}% | Mode: {data['digital_twin']['predicted_failure_mode']}")
            
        assert len(frames_received) == 5
        print("  [PASS] Successfully received 5 consecutive telemetry frames via WebSocket")


async def test_fault_scenarios():
    print("\n--- 2. Testing REST Endpoints & Stateful Fault Injections ---")
    
    # 1. Health check
    health_resp = http_get("/api/health")
    print(f"  Health Check: {health_resp}")
    assert health_resp["status"] == "healthy"
    
    # 2. Status check
    status_resp = http_get("/api/status")
    assert "telemetry" in status_resp and "digital_twin" in status_resp
    print("  [PASS] Status endpoint returned valid combined digital twin frame")
    
    # 3. Throttle control
    th_resp = http_post("/api/throttle", {"throttle_pct": 80.0})
    print(f"  [PASS] Throttle set: {th_resp['message']}")
    
    # 4. Inject COOLANT_LEAK
    print("\n  >> Injecting COOLANT_LEAK...")
    inject_resp = http_post("/api/fault/inject", {"fault_type": "COOLANT_LEAK", "severity": 1.5})
    print(f"  Response: {inject_resp}")
    
    async with websockets.connect(WS_URL) as ws:
        # Wait 4 seconds for thermal runaway to develop
        for _ in range(15):
            msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
            data = json.loads(msg)
        print(f"  [COOLANT_LEAK Telemetry] CHT Max: {data['telemetry']['cht_max']}C (Delta: +{data['physics_residuals']['delta_cht_max']}C) | Health: {data['digital_twin']['health_index_pct']}% | RUL: {data['digital_twin']['rul_minutes']}m | Mode: {data['digital_twin']['predicted_failure_mode']}")
        print(f"  [Advisory] Severity: {data['advisory']['severity']} | Directive: {data['advisory']['action_directive']}")
        assert data["advisory"]["severity"] in ["WARNING", "CRITICAL"]

    # 5. Inject OIL_STARVATION
    print("\n  >> Injecting OIL_STARVATION...")
    inject_resp = http_post("/api/fault/inject", {"fault_type": "OIL_STARVATION", "severity": 1.5})
    print(f"  Response: {inject_resp}")
    
    async with websockets.connect(WS_URL) as ws:
        for _ in range(15):
            msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
            data = json.loads(msg)
        print(f"  [OIL_STARVATION Telemetry] Oil Pressure: {data['telemetry']['oil_pressure_bar']} bar | Vibration RMS: {data['telemetry']['vibration_rms_g']}g | Health: {data['digital_twin']['health_index_pct']}% | Mode: {data['digital_twin']['predicted_failure_mode']}")
        print(f"  [Advisory] Severity: {data['advisory']['severity']} | Directive: {data['advisory']['action_directive']}")
        assert data["advisory"]["severity"] == "CRITICAL"

    # 6. Inject CYLINDER_MISFIRE
    print("\n  >> Injecting CYLINDER_MISFIRE...")
    inject_resp = http_post("/api/fault/inject", {"fault_type": "CYLINDER_MISFIRE", "severity": 1.0})
    print(f"  Response: {inject_resp}")
    
    async with websockets.connect(WS_URL) as ws:
        for _ in range(15):
            msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
            data = json.loads(msg)
        print(f"  [CYLINDER_MISFIRE Telemetry] EGT3: {data['telemetry']['egt3']}C | EGT Spread: {data['physics_residuals']['egt_spread_c']}C | Lat Vib: {data['telemetry']['vibration_x_g']}g | Mode: {data['digital_twin']['predicted_failure_mode']}")
        print(f"  [Advisory] Severity: {data['advisory']['severity']} | Directive: {data['advisory']['action_directive']}")
        assert data["physics_residuals"]["egt_spread_c"] > 80.0 or data["digital_twin"]["predicted_failure_mode"] == "Combustion Loss"

    # 7. Clear Fault
    print("\n  >> Clearing faults and resetting...")
    clear_resp = http_post("/api/fault/clear", {})
    reset_resp = http_post("/api/reset", {})
    print(f"  Clear: {clear_resp['message']} | Reset: {reset_resp['message']}")
    
    print("\n=======================================================")
    print("ALL BACKEND & DIGITAL TWIN TESTS PASSED SUCCESSFULLY! [PASS]")
    print("=======================================================")


if __name__ == "__main__":
    time.sleep(1.0)
    asyncio.run(test_websocket_stream())
    asyncio.run(test_fault_scenarios())
