# -*- coding: utf-8 -*-
"""
DRDO SIH26054: MALE UAV Aero Piston Engine Digital Twin
Module: Main FastAPI Application & Real-Time Telemetry / WebSocket Hub
Provides high-frequency telemetry streaming (5Hz), REST fault injection,
tactical flight advisory integration, and digital twin health monitoring.
"""

import asyncio
import time
from typing import Dict, Any, List, Set, Optional
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from simulator import AeroPistonEngineSimulator, FaultType, EngineTelemetry
from digital_twin import (
    DigitalTwinEngine,
    PhysicsBaselineOutput,
    PhysicsResidualsOutput,
    DigitalTwinPrediction
)
from advisory import AutonomousFlightAdvisoryAgent, TacticalAdvisory


# -----------------------------------------------------------------------------
# PYDANTIC REQUEST / RESPONSE SCHEMAS
# -----------------------------------------------------------------------------
class FaultInjectionRequest(BaseModel):
    fault_type: str = Field(..., description="Fault type: NONE, COOLANT_LEAK, OIL_STARVATION, CYLINDER_MISFIRE")
    severity: float = Field(default=1.0, ge=0.1, le=3.0, description="Severity factor (0.1 to 3.0)")


class ThrottleControlRequest(BaseModel):
    throttle_pct: float = Field(..., ge=0.0, le=100.0, description="Target throttle percentage (0-100%)")


class CombinedDigitalTwinFrame(BaseModel):
    timestamp: float
    flight_time_s: float
    telemetry: EngineTelemetry
    physics_baseline: PhysicsBaselineOutput
    physics_residuals: PhysicsResidualsOutput
    digital_twin: DigitalTwinPrediction
    advisory: TacticalAdvisory
    active_fault: str


# -----------------------------------------------------------------------------
# GLOBAL SERVICE MANAGERS
# -----------------------------------------------------------------------------
class ConnectionManager:
    """Manages real-time WebSocket client connections."""
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            self.active_connections.discard(websocket)

    async def broadcast(self, data: Dict[str, Any]):
        dead_connections = []
        async with self._lock:
            connections = list(self.active_connections)
            
        for connection in connections:
            try:
                await connection.send_json(data)
            except Exception:
                dead_connections.append(connection)
                
        if dead_connections:
            async with self._lock:
                for dead in dead_connections:
                    self.active_connections.discard(dead)

    @property
    def count(self) -> int:
        return len(self.active_connections)


# -----------------------------------------------------------------------------
# APPLICATION LIFECYCLE & STATE
# -----------------------------------------------------------------------------
simulator = AeroPistonEngineSimulator()
digital_twin = DigitalTwinEngine()
advisory_agent = AutonomousFlightAdvisoryAgent()
ws_manager = ConnectionManager()

latest_frame: Optional[CombinedDigitalTwinFrame] = None
is_simulation_paused: bool = False


def compute_next_frame(dt: float = 0.1) -> CombinedDigitalTwinFrame:
    """Computes a single simulation step and updates digital twin."""
    global latest_frame
    telemetry = simulator.step(dt=dt)
    baseline, residuals, prediction = digital_twin.update(telemetry)
    advisory = advisory_agent.evaluate(telemetry, baseline, residuals, prediction)
    
    frame = CombinedDigitalTwinFrame(
        timestamp=telemetry.timestamp,
        flight_time_s=telemetry.flight_time_s,
        telemetry=telemetry,
        physics_baseline=baseline,
        physics_residuals=residuals,
        digital_twin=prediction,
        advisory=advisory,
        active_fault=telemetry.active_fault
    )
    latest_frame = frame
    return frame


async def simulation_loop():
    """
    Background simulation loop.
    Steps physics when unpaused and broadcasts telemetry over WebSockets.
    """
    global latest_frame
    broadcast_counter = 0
    
    while True:
        try:
            if not is_simulation_paused:
                frame = compute_next_frame(dt=0.1)
                broadcast_counter += 1
                if broadcast_counter % 2 == 0 and ws_manager.count > 0:
                    await ws_manager.broadcast(frame.model_dump())
                    
            await asyncio.sleep(0.1)  # 100ms interval
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[Simulation Loop Error] {e}")
            await asyncio.sleep(0.1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    sim_task = asyncio.create_task(simulation_loop())
    print("[Digital Twin] Real-time engine simulator & LSTM background worker initialized.")
    yield
    # Shutdown
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass
    print("[Digital Twin] Background simulation shutdown cleanly.")


# -----------------------------------------------------------------------------
# FASTAPI APP INITIALIZATION
# -----------------------------------------------------------------------------
app = FastAPI(
    title="DRDO SIH26054: MALE UAV Aero Piston Engine Digital Twin",
    version="1.0.0",
    description="Real-Time 1D Thermodynamic & LSTM Digital Twin for Aero Piston Engines (Rotax 914 / Austro AE300)",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# REST API ENDPOINTS
# -----------------------------------------------------------------------------
@app.get("/api/health")
def get_health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "DRDO MALE UAV Aero Piston Engine Digital Twin",
        "active_fault": simulator.active_fault.value,
        "active_ws_clients": ws_manager.count,
        "system_time": time.time()
    }


@app.get("/api/status", response_model=Optional[CombinedDigitalTwinFrame])
def get_current_status():
    """Returns the latest combined digital twin telemetry frame."""
    if latest_frame is None:
        raise HTTPException(status_code=503, detail="Digital twin engine initializing...")
    return latest_frame


@app.post("/api/fault/inject")
def inject_fault(req: FaultInjectionRequest):
    """
    Inject stateful fault into the digital twin simulation:
    - COOLANT_LEAK: Exponential CHT thermal runaway
    - OIL_STARVATION: Oil pressure collapse & bearing friction spike
    - CYLINDER_MISFIRE: Cylinder 3 combustion loss & rotational imbalance
    - NONE: Clear fault and return to nominal baseline
    """
    try:
        simulator.inject_fault(req.fault_type, req.severity)
        return {
            "status": "success",
            "message": f"Fault '{req.fault_type.upper()}' injected with severity {req.severity}",
            "active_fault": simulator.active_fault.value,
            "severity": simulator.fault_severity
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/fault/clear")
def clear_fault():
    """Clear any active fault and recover towards nominal baseline."""
    simulator.clear_fault()
    return {
        "status": "success",
        "message": "Active fault cleared. Engine recovering towards nominal equilibrium.",
        "active_fault": simulator.active_fault.value
    }


@app.post("/api/throttle")
def set_throttle(req: ThrottleControlRequest):
    """Set target throttle percentage (0-100%)."""
    simulator.set_throttle(req.throttle_pct)
    return {
        "status": "success",
        "throttle_pct": simulator.throttle_pct,
        "message": f"Throttle set to {simulator.throttle_pct}%"
    }


@app.post("/api/reset")
def reset_simulation():
    """Reset engine simulation and digital twin states to initial flight conditions."""
    global simulator, digital_twin
    simulator.reset()
    digital_twin = DigitalTwinEngine()
    return {
        "status": "success",
        "message": "Engine simulation and digital twin state reset to initial cruise baseline."
    }


@app.get("/api/sim/state")
def get_simulation_state():
    """Returns whether simulation is paused or active."""
    return {
        "is_paused": is_simulation_paused,
        "active_fault": simulator.active_fault.value,
        "throttle_pct": simulator.throttle_pct,
        "flight_time_s": simulator.flight_time_s
    }


@app.post("/api/sim/pause")
def pause_simulation():
    """Pauses continuous simulation loop so student can inspect values."""
    global is_simulation_paused
    is_simulation_paused = True
    return {"status": "success", "is_paused": True, "message": "Simulation paused."}


@app.post("/api/sim/resume")
def resume_simulation():
    """Resumes continuous simulation loop."""
    global is_simulation_paused
    is_simulation_paused = False
    return {"status": "success", "is_paused": False, "message": "Simulation running."}


@app.post("/api/sim/toggle")
def toggle_simulation():
    """Toggles play / pause state."""
    global is_simulation_paused
    is_simulation_paused = not is_simulation_paused
    return {"status": "success", "is_paused": is_simulation_paused}


@app.post("/api/sim/step")
async def step_simulation_single_frame():
    """Manually advances simulation by a single step (100ms) for step-by-step presentation."""
    frame = compute_next_frame(dt=0.1)
    if ws_manager.count > 0:
        await ws_manager.broadcast(frame.model_dump())
    return {
        "status": "success",
        "message": "Advanced single frame.",
        "frame": frame
    }


# -----------------------------------------------------------------------------
# WEBSOCKET REAL-TIME STREAMING ENDPOINT
# -----------------------------------------------------------------------------
@app.websocket("/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    """
    High-frequency bi-directional WebSocket streaming combined Digital Twin telemetry:
    - Sensor Telemetry (RPM, MAP, CHT1-4, EGT1-4, Oil P/T, Fuel Flow, 3-Axis Vibration)
    - 1D Thermodynamic Physics Baseline
    - Physics Residuals & Anomaly Metrics
    - LSTM Health Index & Remaining Useful Life (RUL)
    - Autonomous Tactical Flight Advisory & Action Directives
    """
    await ws_manager.connect(websocket)
    
    if latest_frame is not None:
        await websocket.send_json(latest_frame.model_dump())
        
    try:
        while True:
            data = await websocket.receive_json()
            cmd_type = data.get("type", "").upper()
            
            if cmd_type == "INJECT_FAULT":
                fault = data.get("fault", "NONE")
                sev = float(data.get("severity", 1.0))
                simulator.inject_fault(fault, sev)
                await websocket.send_json({"type": "ACK", "message": f"Fault {fault} injected"})
                
            elif cmd_type == "CLEAR_FAULT":
                simulator.clear_fault()
                await websocket.send_json({"type": "ACK", "message": "Fault cleared"})
                
            elif cmd_type == "SET_THROTTLE":
                th = float(data.get("throttle", 75.0))
                simulator.set_throttle(th)
                await websocket.send_json({"type": "ACK", "message": f"Throttle set to {th}%"})
                
            elif cmd_type == "RESET":
                simulator.reset()
                digital_twin.reset() if hasattr(digital_twin, "reset") else None
                await websocket.send_json({"type": "ACK", "message": "Simulation reset"})
                
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception as e:
        await ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
