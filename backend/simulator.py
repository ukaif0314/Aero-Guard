# -*- coding: utf-8 -*-
"""
DRDO SIH26054: MALE UAV Aero Piston Engine Digital Twin
Module: High-Fidelity Real-Time Aero-Piston Engine Simulator
Simulates a 4-cylinder turbocharged aero piston engine (Rotax 914 / Austro AE300 class)
with stateful multi-mode fault injection and high-frequency telemetry.
"""

import time
import math
import random
from typing import Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class FaultType(str, Enum):
    NONE = "NONE"
    COOLANT_LEAK = "COOLANT_LEAK"
    OIL_STARVATION = "OIL_STARVATION"
    CYLINDER_MISFIRE = "CYLINDER_MISFIRE"


class EngineTelemetry(BaseModel):
    timestamp: float = Field(..., description="Epoch timestamp in seconds")
    flight_time_s: float = Field(..., description="Elapsed flight time in seconds")
    
    # Engine Speeds & Load
    rpm: float = Field(..., description="Engine crankshaft rotational speed (RPM)")
    throttle_pct: float = Field(..., description="Throttle position percentage (0-100%)")
    manifold_pressure_inhg: float = Field(..., description="Manifold Absolute Pressure in inHg (MAP)")
    fuel_flow_lph: float = Field(..., description="Fuel consumption flow rate (L/h)")
    fuel_pressure_bar: float = Field(..., description="Fuel rail pressure (bar)")
    
    # Cylinder Head Temperatures (CHT in deg C)
    cht1: float = Field(..., description="Cylinder 1 Head Temperature (deg C)")
    cht2: float = Field(..., description="Cylinder 2 Head Temperature (deg C)")
    cht3: float = Field(..., description="Cylinder 3 Head Temperature (deg C)")
    cht4: float = Field(..., description="Cylinder 4 Head Temperature (deg C)")
    cht_avg: float = Field(..., description="Mean Cylinder Head Temperature (deg C)")
    cht_max: float = Field(..., description="Max Cylinder Head Temperature (deg C)")
    
    # Exhaust Gas Temperatures (EGT in deg C)
    egt1: float = Field(..., description="Cylinder 1 Exhaust Gas Temperature (deg C)")
    egt2: float = Field(..., description="Cylinder 2 Exhaust Gas Temperature (deg C)")
    egt3: float = Field(..., description="Cylinder 3 Exhaust Gas Temperature (deg C)")
    egt4: float = Field(..., description="Cylinder 4 Exhaust Gas Temperature (deg C)")
    egt_avg: float = Field(..., description="Mean Exhaust Gas Temperature (deg C)")
    egt_max: float = Field(..., description="Max Exhaust Gas Temperature (deg C)")
    
    # Lubrication & Cooling
    oil_pressure_bar: float = Field(..., description="Engine Oil Pressure (bar)")
    oil_temp_c: float = Field(..., description="Engine Oil Temperature (deg C)")
    coolant_temp_c: float = Field(..., description="Liquid Coolant Temperature (deg C)")
    
    # 3-Axis Dynamics & Vibration
    vibration_x_g: float = Field(..., description="Lateral RMS Vibration (g)")
    vibration_y_g: float = Field(..., description="Longitudinal RMS Vibration (g)")
    vibration_z_g: float = Field(..., description="Vertical RMS Vibration (g)")
    vibration_rms_g: float = Field(..., description="Total Composite 3-Axis RMS Vibration (g)")
    
    # Flight Envelope Context
    altitude_ft: float = Field(..., description="UAV Barometric Altitude (feet)")
    airspeed_kts: float = Field(..., description="Indicated Airspeed (knots)")
    ambient_temp_c: float = Field(..., description="Ambient Outside Air Temp (deg C)")
    
    # Fault Status
    active_fault: str = Field(..., description="Currently active fault scenario")
    fault_elapsed_s: float = Field(..., description="Seconds elapsed since fault injection")


class AeroPistonEngineSimulator:
    """
    High-fidelity physics simulator for 4-cylinder aero piston engines.
    Integrates 1st order lag dynamics, thermal capacitances, fluid models,
    and stateful fault degradation kinetics.
    """
    def __init__(self):
        self.reset()

    def reset(self):
        # Time tracking
        self.start_time = time.time()
        self.flight_time_s = 0.0
        self.dt = 0.1  # 100ms simulation step
        
        # Flight Envelope
        self.altitude_ft = 8500.0  # Cruise altitude
        self.airspeed_kts = 85.0   # Cruise airspeed
        self.ambient_temp_c = 15.0 - (1.98 * (self.altitude_ft / 1000.0))  # Standard lapse rate ~ -1.8 deg C
        
        # Throttle & Target states
        self.throttle_pct = 75.0  # 75% Continuous Cruise Power
        self.target_rpm = 5200.0
        
        # Dynamic State Variables (Current values)
        self.rpm = 5200.0
        self.map_inhg = 31.5  # Turbocharged boost
        self.fuel_flow_lph = 24.5
        self.fuel_pressure_bar = 3.0
        
        # Thermal States (deg C)
        self.cht = [105.0, 108.0, 107.0, 104.0]  # Cylinders 1, 2, 3, 4
        self.egt = [815.0, 822.0, 818.0, 810.0]  # Cylinders 1, 2, 3, 4
        self.oil_temp_c = 92.0
        self.coolant_temp_c = 88.0
        
        # Lubrication States
        self.oil_pressure_bar = 4.2
        
        # Vibration States (g)
        self.vib_x = 0.95
        self.vib_y = 0.88
        self.vib_z = 1.15
        
        # Fault Tracking
        self.active_fault = FaultType.NONE
        self.fault_start_time: Optional[float] = None
        self.fault_elapsed_s = 0.0
        self.fault_severity = 1.0  # Scaling factor (0.1 to 2.0)

    def set_throttle(self, throttle_pct: float):
        """Set target throttle percentage (0-100%)."""
        self.throttle_pct = max(0.0, min(100.0, float(throttle_pct)))

    def inject_fault(self, fault_type: str, severity: float = 1.0):
        """Inject stateful fault into the engine simulator."""
        try:
            enum_val = FaultType(fault_type.upper())
        except ValueError:
            enum_val = FaultType.NONE
            
        self.active_fault = enum_val
        self.fault_severity = max(0.1, min(3.0, float(severity)))
        if enum_val != FaultType.NONE:
            self.fault_start_time = self.flight_time_s
            self.fault_elapsed_s = 0.0
        else:
            self.fault_start_time = None
            self.fault_elapsed_s = 0.0

    def clear_fault(self):
        """Clear active fault and initiate graceful recovery towards nominal baseline."""
        self.active_fault = FaultType.NONE
        self.fault_start_time = None
        self.fault_elapsed_s = 0.0

    def step(self, dt: Optional[float] = None) -> EngineTelemetry:
        """
        Advance engine simulation by dt seconds (default 0.1s / 100ms).
        Computes dynamic thermal, pneumatic, fluid, and mechanical interactions.
        """
        if dt is None:
            dt = self.dt
        
        self.flight_time_s += dt
        if self.active_fault != FaultType.NONE and self.fault_start_time is not None:
            self.fault_elapsed_s = self.flight_time_s - self.fault_start_time
        else:
            self.fault_elapsed_s = 0.0

        # -------------------------------------------------------------
        # 1. THROTTLE & TURBOCHARGED MANIFOLD PRESSURE (MAP) DYNAMICS
        # -------------------------------------------------------------
        base_target_rpm = 4800.0 + (self.throttle_pct / 100.0) * 1000.0
        base_target_map = 25.0 + (self.throttle_pct / 100.0) * 13.5
        
        if self.active_fault == FaultType.CYLINDER_MISFIRE:
            misfire_penalty = min(0.20, 0.05 + 0.15 * (1.0 - math.exp(-self.fault_elapsed_s / 3.0)))
            base_target_rpm *= (1.0 - misfire_penalty)
            
        rpm_alpha = 1.0 - math.exp(-dt / 0.6)
        map_alpha = 1.0 - math.exp(-dt / 0.4)
        self.rpm += (base_target_rpm - self.rpm) * rpm_alpha
        self.map_inhg += (base_target_map - self.map_inhg) * map_alpha
        
        target_fuel_flow = 16.0 + (self.map_inhg - 25.0) * 1.05 + (self.rpm - 4800.0) * 0.004
        self.fuel_flow_lph += (target_fuel_flow - self.fuel_flow_lph) * 0.2

        # -------------------------------------------------------------
        # 2. THERMAL EQUILIBRIUM CALCULATIONS (CHT & EGT)
        # -------------------------------------------------------------
        base_cht = 95.0 + (self.throttle_pct / 100.0) * 28.0 + (self.ambient_temp_c - 15.0) * 0.25
        base_egt = 770.0 + (self.throttle_pct / 100.0) * 75.0
        
        cht_targets = [
            base_cht - 1.5,
            base_cht + 2.8,
            base_cht + 1.9,
            base_cht - 2.2
        ]
        egt_targets = [
            base_egt - 4.0,
            base_egt + 6.0,
            base_egt + 2.0,
            base_egt - 5.0
        ]
        
        # -------------------------------------------------------------
        # 3. FAULT MODES INJECTION KINETICS
        # -------------------------------------------------------------
        friction_factor = 1.0
        
        # Fault: COOLANT_LEAK -> Exponential CHT runaway
        if self.active_fault == FaultType.COOLANT_LEAK:
            t = self.fault_elapsed_s
            leak_progression = 1.0 - math.exp(-t / 18.0)
            cht_surge = 58.0 * (1.0 - math.exp(-t / 22.0)) * self.fault_severity
            cht_targets[0] += cht_surge * 0.92
            cht_targets[1] += cht_surge * 1.08
            cht_targets[2] += cht_surge * 1.04
            cht_targets[3] += cht_surge * 0.88
            self.coolant_temp_c += ((128.0 - self.coolant_temp_c) * 0.08)
            
        # Fault: OIL_STARVATION -> Pressure collapse & bearing friction spike
        if self.active_fault == FaultType.OIL_STARVATION:
            t = self.fault_elapsed_s
            pressure_decay = math.exp(-t / 5.0)
            target_oil_p = 0.5 + 3.7 * pressure_decay
            self.oil_pressure_bar += (target_oil_p - self.oil_pressure_bar) * 0.35
            friction_factor = 1.0 + (1.0 - pressure_decay) * 4.5 * self.fault_severity
            self.oil_temp_c += ((142.0 - self.oil_temp_c) * 0.06 * self.fault_severity)
        else:
            target_oil_p = 2.6 + (self.rpm / 5800.0) * 1.8 - (self.oil_temp_c - 90.0) * 0.02
            self.oil_pressure_bar += (target_oil_p - self.oil_pressure_bar) * 0.15
            target_oil_temp = 86.0 + (self.throttle_pct / 100.0) * 16.0
            self.oil_temp_c += (target_oil_temp - self.oil_temp_c) * 0.03

        # Fault: CYLINDER_MISFIRE -> EGT3 drops drastically to cold manifold
        if self.active_fault == FaultType.CYLINDER_MISFIRE:
            t = self.fault_elapsed_s
            misfire_decay = math.exp(-t / 2.5)
            egt_targets[2] = 280.0 + (base_egt - 280.0) * misfire_decay
            cht_targets[2] -= (22.0 * (1.0 - misfire_decay))
            
        cht_alpha = 1.0 - math.exp(-dt / 4.5)
        egt_alpha = 1.0 - math.exp(-dt / 0.8)
        
        for i in range(4):
            self.cht[i] += (cht_targets[i] - self.cht[i]) * cht_alpha
            self.egt[i] += (egt_targets[i] - self.egt[i]) * egt_alpha

        # -------------------------------------------------------------
        # 4. VIBRATION DYNAMICS (3-Axis Accelerometer RMS in g)
        # -------------------------------------------------------------
        base_vib = 0.80 + (self.rpm / 5800.0) * 0.45
        target_vib_x = base_vib * 0.95
        target_vib_y = base_vib * 0.85
        target_vib_z = base_vib * 1.15
        
        if self.active_fault == FaultType.OIL_STARVATION:
            bearing_vib_surge = min(9.5, 0.5 + (friction_factor - 1.0) * 1.8)
            target_vib_x += bearing_vib_surge * 0.9
            target_vib_y += bearing_vib_surge * 1.1
            target_vib_z += bearing_vib_surge * 1.25
            
        elif self.active_fault == FaultType.CYLINDER_MISFIRE:
            unbalance_surge = 3.8 * self.fault_severity
            target_vib_x += unbalance_surge * 1.2
            target_vib_y += unbalance_surge * 0.7
            target_vib_z += unbalance_surge * 1.0
            
        elif self.active_fault == FaultType.COOLANT_LEAK:
            if max(self.cht) > 130.0:
                detonation_vib = (max(self.cht) - 130.0) * 0.06
                target_vib_x += detonation_vib
                target_vib_z += detonation_vib * 1.3
                
        self.vib_x += (target_vib_x - self.vib_x) * 0.25
        self.vib_y += (target_vib_y - self.vib_y) * 0.25
        self.vib_z += (target_vib_z - self.vib_z) * 0.25

        # -------------------------------------------------------------
        # 5. SENSOR NOISE & TELEMETRY STRUCT GENERATION
        # -------------------------------------------------------------
        rpm_noise = random.gauss(0, 4.0)
        map_noise = random.gauss(0, 0.08)
        cht_noise = [random.gauss(0, 0.25) for _ in range(4)]
        egt_noise = [random.gauss(0, 1.2) for _ in range(4)]
        oil_p_noise = random.gauss(0, 0.02)
        oil_t_noise = random.gauss(0, 0.15)
        vib_noise = [random.gauss(0, 0.03) for _ in range(3)]
        
        telemetry = EngineTelemetry(
            timestamp=time.time(),
            flight_time_s=round(self.flight_time_s, 2),
            rpm=round(self.rpm + rpm_noise, 1),
            throttle_pct=round(self.throttle_pct, 1),
            manifold_pressure_inhg=round(max(10.0, self.map_inhg + map_noise), 2),
            fuel_flow_lph=round(max(0.0, self.fuel_flow_lph + random.gauss(0, 0.1)), 2),
            fuel_pressure_bar=round(self.fuel_pressure_bar + random.gauss(0, 0.01), 2),
            
            cht1=round(self.cht[0] + cht_noise[0], 2),
            cht2=round(self.cht[1] + cht_noise[1], 2),
            cht3=round(self.cht[2] + cht_noise[2], 2),
            cht4=round(self.cht[3] + cht_noise[3], 2),
            cht_avg=round(sum(self.cht) / 4.0, 2),
            cht_max=round(max(self.cht), 2),
            
            egt1=round(self.egt[0] + egt_noise[0], 1),
            egt2=round(self.egt[1] + egt_noise[1], 1),
            egt3=round(self.egt[2] + egt_noise[2], 1),
            egt4=round(self.egt[3] + egt_noise[3], 1),
            egt_avg=round(sum(self.egt) / 4.0, 1),
            egt_max=round(max(self.egt), 1),
            
            oil_pressure_bar=round(max(0.1, self.oil_pressure_bar + oil_p_noise), 2),
            oil_temp_c=round(self.oil_temp_c + oil_t_noise, 1),
            coolant_temp_c=round(self.coolant_temp_c + random.gauss(0, 0.2), 1),
            
            vibration_x_g=round(max(0.1, self.vib_x + vib_noise[0]), 2),
            vibration_y_g=round(max(0.1, self.vib_y + vib_noise[1]), 2),
            vibration_z_g=round(max(0.1, self.vib_z + vib_noise[2]), 2),
            vibration_rms_g=round(math.sqrt(self.vib_x**2 + self.vib_y**2 + self.vib_z**2), 2),
            
            altitude_ft=round(self.altitude_ft, 1),
            airspeed_kts=round(self.airspeed_kts + random.gauss(0, 0.3), 1),
            ambient_temp_c=round(self.ambient_temp_c, 1),
            
            active_fault=self.active_fault.value,
            fault_elapsed_s=round(self.fault_elapsed_s, 2)
        )
        return telemetry
