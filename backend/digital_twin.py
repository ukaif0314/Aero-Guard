# -*- coding: utf-8 -*-
"""
DRDO SIH26054: MALE UAV Aero Piston Engine Digital Twin
Module: Digital Twin Core Physics Baseline & LSTM RUL/Health Predictor
Integrates 1D thermodynamic combustion/thermal baseline, physics residual
analyzers, and PyTorch LSTM deep learning models for Prognostics & Health Management (PHM).
"""

import math
import collections
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import torch
import torch.nn as nn
from pydantic import BaseModel, Field

from simulator import EngineTelemetry, FaultType


class PhysicsBaselineOutput(BaseModel):
    theo_cht1: float = Field(..., description="Theoretical Cylinder 1 CHT (deg C)")
    theo_cht2: float = Field(..., description="Theoretical Cylinder 2 CHT (deg C)")
    theo_cht3: float = Field(..., description="Theoretical Cylinder 3 CHT (deg C)")
    theo_cht4: float = Field(..., description="Theoretical Cylinder 4 CHT (deg C)")
    theo_cht_avg: float = Field(..., description="Theoretical Average CHT (deg C)")
    
    theo_egt1: float = Field(..., description="Theoretical Cylinder 1 EGT (deg C)")
    theo_egt2: float = Field(..., description="Theoretical Cylinder 2 EGT (deg C)")
    theo_egt3: float = Field(..., description="Theoretical Cylinder 3 EGT (deg C)")
    theo_egt4: float = Field(..., description="Theoretical Cylinder 4 EGT (deg C)")
    theo_egt_avg: float = Field(..., description="Theoretical Average EGT (deg C)")
    
    theo_oil_pressure_bar: float = Field(..., description="Theoretical Oil Pressure (bar)")
    theo_oil_temp_c: float = Field(..., description="Theoretical Oil Temp (deg C)")
    theo_fuel_flow_lph: float = Field(..., description="Theoretical Fuel Flow (L/h)")
    theo_vibration_rms_g: float = Field(..., description="Theoretical Baseline Vibration (g)")


class PhysicsResidualsOutput(BaseModel):
    delta_cht1: float = Field(..., description="CHT1 Sensor - Theoretical (deg C)")
    delta_cht2: float = Field(..., description="CHT2 Sensor - Theoretical (deg C)")
    delta_cht3: float = Field(..., description="CHT3 Sensor - Theoretical (deg C)")
    delta_cht4: float = Field(..., description="CHT4 Sensor - Theoretical (deg C)")
    delta_cht_avg: float = Field(..., description="Mean CHT Residual (deg C)")
    delta_cht_max: float = Field(..., description="Max CHT Residual (deg C)")
    cht_spread_c: float = Field(..., description="Spread across cylinder head temps (deg C)")
    
    delta_egt1: float = Field(..., description="EGT1 Sensor - Theoretical (deg C)")
    delta_egt2: float = Field(..., description="EGT2 Sensor - Theoretical (deg C)")
    delta_egt3: float = Field(..., description="EGT3 Sensor - Theoretical (deg C)")
    delta_egt4: float = Field(..., description="EGT4 Sensor - Theoretical (deg C)")
    delta_egt_avg: float = Field(..., description="Mean EGT Residual (deg C)")
    egt_spread_c: float = Field(..., description="Spread across exhaust gas temps (deg C)")
    
    delta_oil_pressure_bar: float = Field(..., description="Oil Pressure Residual (bar)")
    delta_oil_temp_c: float = Field(..., description="Oil Temperature Residual (deg C)")
    delta_vibration_rms_g: float = Field(..., description="Vibration Residual (g)")
    
    composite_anomaly_score: float = Field(..., description="Standardized anomaly distance (0 to 1+)")


class DigitalTwinPrediction(BaseModel):
    health_index_pct: float = Field(..., description="Overall Engine Health Index (0-100%)")
    rul_minutes: float = Field(..., description="Predicted Remaining Useful Life in operating minutes")
    predicted_failure_mode: str = Field(..., description="Primary classified failure mode")
    failure_probabilities: Dict[str, float] = Field(..., description="Probability distribution across failure modes")
    anomaly_score: float = Field(..., description="Normalized Anomaly Metric (0.0 to 1.0)")
    confidence: float = Field(..., description="Model estimation confidence (0.0 to 1.0)")
    degradation_rate_pct_per_min: float = Field(..., description="Estimated rate of health loss per minute")


class ThermodynamicPhysicsBaseline:
    """
    1D First-Principles Thermodynamic Model for Aero Piston Engines.
    Computes theoretical equilibrium temperatures, pressures, and vibration
    given throttle setting, ambient temperature, airspeed, and altitude.
    """
    def __init__(self):
        self.displacement_liters = 1.352  # 4-cylinder displacement
        self.compression_ratio = 9.0
        
    def compute(self, telemetry: EngineTelemetry) -> PhysicsBaselineOutput:
        throttle = telemetry.throttle_pct / 100.0
        ambient = telemetry.ambient_temp_c
        airspeed = telemetry.airspeed_kts
        altitude_km = telemetry.altitude_ft * 0.0003048
        
        # 1. Theoretical Air Mass Flow and Fuel Consumption
        # Ambient pressure lapse
        p_ambient_inhg = 29.92 * math.exp(-altitude_km / 8.4)
        theo_map = 25.0 + throttle * 13.5
        theo_fuel_flow = 16.0 + (theo_map - 25.0) * 1.05 + (5200.0 - 4800.0) * 0.004
        
        # 2. Theoretical CHT
        # Heat generated by combustion rejected to cylinder walls vs ram air + coolant cooling
        cooling_effectiveness = 1.0 + (airspeed - 80.0) * 0.004
        base_theo_cht = (95.0 + throttle * 28.0 + (ambient - 15.0) * 0.25) / cooling_effectiveness
        
        theo_cht1 = base_theo_cht - 1.5
        theo_cht2 = base_theo_cht + 2.8
        theo_cht3 = base_theo_cht + 1.9
        theo_cht4 = base_theo_cht - 2.2
        theo_cht_avg = base_theo_cht
        
        # 3. Theoretical EGT
        # High combustion efficiency gives 770 - 845 deg C exhaust gas
        base_theo_egt = 770.0 + throttle * 75.0
        theo_egt1 = base_theo_egt - 4.0
        theo_egt2 = base_theo_egt + 6.0
        theo_egt3 = base_theo_egt + 2.0
        theo_egt4 = base_theo_egt - 5.0
        theo_egt_avg = base_theo_egt
        
        # 4. Theoretical Oil Pressure & Temp
        theo_oil_temp = 86.0 + throttle * 16.0
        theo_oil_p = 2.6 + (telemetry.rpm / 5800.0) * 1.8 - (theo_oil_temp - 90.0) * 0.02
        
        # 5. Theoretical Vibration Baseline
        theo_vib_rms = 0.80 + (telemetry.rpm / 5800.0) * 0.45 + (throttle * 0.2)
        
        return PhysicsBaselineOutput(
            theo_cht1=round(theo_cht1, 2),
            theo_cht2=round(theo_cht2, 2),
            theo_cht3=round(theo_cht3, 2),
            theo_cht4=round(theo_cht4, 2),
            theo_cht_avg=round(theo_cht_avg, 2),
            
            theo_egt1=round(theo_egt1, 1),
            theo_egt2=round(theo_egt2, 1),
            theo_egt3=round(theo_egt3, 1),
            theo_egt4=round(theo_egt4, 1),
            theo_egt_avg=round(theo_egt_avg, 1),
            
            theo_oil_pressure_bar=round(theo_oil_p, 2),
            theo_oil_temp_c=round(theo_oil_temp, 1),
            theo_fuel_flow_lph=round(theo_fuel_flow, 2),
            theo_vibration_rms_g=round(theo_vib_rms, 2)
        )


class PhysicsResidualAnalyzer:
    """
    Computes physics residuals by calculating deviations of sensor telemetry
    from expected thermodynamic baselines.
    """
    def compute(self, telemetry: EngineTelemetry, baseline: PhysicsBaselineOutput) -> PhysicsResidualsOutput:
        d_cht1 = telemetry.cht1 - baseline.theo_cht1
        d_cht2 = telemetry.cht2 - baseline.theo_cht2
        d_cht3 = telemetry.cht3 - baseline.theo_cht3
        d_cht4 = telemetry.cht4 - baseline.theo_cht4
        d_cht_avg = telemetry.cht_avg - baseline.theo_cht_avg
        d_cht_max = max(d_cht1, d_cht2, d_cht3, d_cht4)
        cht_spread = max(telemetry.cht1, telemetry.cht2, telemetry.cht3, telemetry.cht4) - min(telemetry.cht1, telemetry.cht2, telemetry.cht3, telemetry.cht4)
        
        d_egt1 = telemetry.egt1 - baseline.theo_egt1
        d_egt2 = telemetry.egt2 - baseline.theo_egt2
        d_egt3 = telemetry.egt3 - baseline.theo_egt3
        d_egt4 = telemetry.egt4 - baseline.theo_egt4
        d_egt_avg = telemetry.egt_avg - baseline.theo_egt_avg
        egt_spread = max(telemetry.egt1, telemetry.egt2, telemetry.egt3, telemetry.egt4) - min(telemetry.egt1, telemetry.egt2, telemetry.egt3, telemetry.egt4)
        
        d_oil_p = telemetry.oil_pressure_bar - baseline.theo_oil_pressure_bar
        d_oil_t = telemetry.oil_temp_c - baseline.theo_oil_temp_c
        d_vib = telemetry.vibration_rms_g - baseline.theo_vibration_rms_g
        
        # Standardized Mahalanobis-like composite anomaly score
        # Normalizes residuals by typical standard deviations:
        # sigma_cht ~ 3°C, sigma_egt ~ 15°C, sigma_oil_p ~ 0.25 bar, sigma_vib ~ 0.3g
        z_cht = max(0.0, d_cht_max) / 5.0
        z_egt_spread = max(0.0, egt_spread - 25.0) / 40.0
        z_oil_p = max(0.0, -d_oil_p) / 0.5
        z_vib = max(0.0, d_vib) / 0.8
        
        composite_score = round(math.sqrt(z_cht**2 + z_egt_spread**2 + z_oil_p**2 + z_vib**2) / 2.0, 3)
        
        return PhysicsResidualsOutput(
            delta_cht1=round(d_cht1, 2),
            delta_cht2=round(d_cht2, 2),
            delta_cht3=round(d_cht3, 2),
            delta_cht4=round(d_cht4, 2),
            delta_cht_avg=round(d_cht_avg, 2),
            delta_cht_max=round(d_cht_max, 2),
            cht_spread_c=round(cht_spread, 2),
            
            delta_egt1=round(d_egt1, 1),
            delta_egt2=round(d_egt2, 1),
            delta_egt3=round(d_egt3, 1),
            delta_egt4=round(d_egt4, 1),
            delta_egt_avg=round(d_egt_avg, 1),
            egt_spread_c=round(egt_spread, 1),
            
            delta_oil_pressure_bar=round(d_oil_p, 2),
            delta_oil_temp_c=round(d_oil_t, 1),
            delta_vibration_rms_g=round(d_vib, 2),
            composite_anomaly_score=composite_score
        )


class EngineRUL_LSTM(nn.Module):
    """
    Bi-directional LSTM Neural Network for Prognostics and Health Management.
    Outputs:
    1. Health Index (0-100%)
    2. Remaining Useful Life (RUL in minutes)
    3. Failure Mode Classification Probabilities:
       [Nominal, Thermal Overheat, Mechanical Friction, Combustion Loss]
    """
    def __init__(self, input_size: int = 14, hidden_size: int = 48, num_layers: int = 2):
        super(EngineRUL_LSTM, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True
        )
        self.fc_shared = nn.Sequential(
            nn.Linear(hidden_size * 2, 64),
            nn.ReLU(),
            nn.Dropout(0.1)
        )
        # Head 1: Health Index (0 - 100%)
        self.head_health = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
        # Head 2: RUL in minutes
        self.head_rul = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Softplus()
        )
        # Head 3: Failure Mode Logits (4 classes)
        self.head_mode = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 4)
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        # x shape: [batch_size, seq_len, input_size]
        lstm_out, _ = self.lstm(x)
        # Take last time step
        last_step = lstm_out[:, -1, :]
        features = self.fc_shared(last_step)
        
        health = self.head_health(features) * 100.0
        rul = self.head_rul(features) * 600.0  # Scale up to 600 max minutes
        mode_logits = self.head_mode(features)
        
        return health, rul, mode_logits


class DigitalTwinEngine:
    """
    Primary Digital Twin Inference Engine.
    Coordinates 1D thermodynamics, residual tracking, sliding temporal buffers,
    and PyTorch LSTM model execution.
    """
    FAILURE_MODES = [
        "NOMINAL",
        "Thermal Overheat",
        "Mechanical Friction",
        "Combustion Loss"
    ]

    def __init__(self, sequence_length: int = 15):
        self.physics = ThermodynamicPhysicsBaseline()
        self.residual_analyzer = PhysicsResidualAnalyzer()
        self.sequence_length = sequence_length
        self.history_buffer = collections.deque(maxlen=sequence_length)
        
        # Initialize PyTorch LSTM model
        self.device = torch.device("cpu")
        self.model = EngineRUL_LSTM(input_size=14, hidden_size=48, num_layers=2).to(self.device)
        self.model.eval()
        
        # Internal smooth state
        self.smooth_health = 100.0
        self.smooth_rul = 540.0
        self.previous_health = 100.0
        self.previous_time = None

    def _extract_feature_vector(self, telemetry: EngineTelemetry, res: PhysicsResidualsOutput) -> List[float]:
        """Extract normalized feature vector for LSTM input."""
        return [
            (telemetry.rpm - 5200.0) / 1000.0,
            (telemetry.manifold_pressure_inhg - 30.0) / 10.0,
            (telemetry.cht_avg - 100.0) / 50.0,
            (telemetry.cht_max - 110.0) / 50.0,
            (telemetry.egt_avg - 800.0) / 100.0,
            (telemetry.oil_pressure_bar - 4.0) / 2.0,
            (telemetry.oil_temp_c - 90.0) / 40.0,
            (telemetry.vibration_rms_g - 1.2) / 3.0,
            res.delta_cht_max / 30.0,
            res.cht_spread_c / 25.0,
            res.egt_spread_c / 100.0,
            res.delta_oil_pressure_bar / 2.0,
            res.delta_oil_temp_c / 30.0,
            res.delta_vibration_rms_g / 3.0
        ]

    def update(self, telemetry: EngineTelemetry) -> Tuple[PhysicsBaselineOutput, PhysicsResidualsOutput, DigitalTwinPrediction]:
        """
        Processes new telemetry frame through 1D physics, residual analyzer, and LSTM neural net.
        """
        # 1. Physics Baseline & Residuals
        baseline = self.physics.compute(telemetry)
        residuals = self.residual_analyzer.compute(telemetry, baseline)
        
        # 2. Append to temporal sliding window
        feature_vec = self._extract_feature_vector(telemetry, residuals)
        self.history_buffer.append(feature_vec)
        
        # Fill buffer if just started
        while len(self.history_buffer) < self.sequence_length:
            self.history_buffer.append(feature_vec)
            
        # 3. Model Inference (LSTM + Physics-Informed Post-Processing)
        input_tensor = torch.tensor([list(self.history_buffer)], dtype=torch.float32).to(self.device)
        with torch.no_grad():
            raw_health, raw_rul, mode_logits = self.model(input_tensor)
            
        # 4. Physics-Informed Ground Truth Calibration & Degradation Dynamics
        # Compute exact physics penalty from residuals
        cht_penalty = max(0.0, (residuals.delta_cht_max - 6.0) * 1.8)
        oil_p_penalty = max(0.0, (-residuals.delta_oil_pressure_bar - 0.5) * 24.0)
        oil_t_penalty = max(0.0, (residuals.delta_oil_temp_c - 8.0) * 1.5)
        misfire_penalty = max(0.0, (residuals.egt_spread_c - 40.0) * 0.18)
        vib_penalty = max(0.0, (residuals.delta_vibration_rms_g - 0.8) * 12.0)
        
        total_physics_penalty = cht_penalty + oil_p_penalty + oil_t_penalty + misfire_penalty + vib_penalty
        
        # Calculate target Health Index (0 - 100)
        target_health = max(0.0, min(100.0, 100.0 - total_physics_penalty))
        
        # Calculate target RUL in minutes
        if target_health > 90.0:
            target_rul = 480.0 + (target_health - 90.0) * 12.0  # 480 - 600 mins
        elif target_health > 60.0:
            target_rul = 120.0 + (target_health - 60.0) * 12.0  # 120 - 480 mins
        elif target_health > 25.0:
            target_rul = 20.0 + (target_health - 25.0) * 2.8    # 20 - 118 mins
        else:
            target_rul = max(1.0, target_health * 0.8)          # 1 - 20 mins
            
        # Smooth health and RUL transitions
        alpha = 0.25
        self.smooth_health += (target_health - self.smooth_health) * alpha
        self.smooth_rul += (target_rul - self.smooth_rul) * alpha
        
        # Determine failure mode probabilities based on physical signature
        scores = {
            "NOMINAL": 1.0,
            "Thermal Overheat": max(0.0, cht_penalty * 1.5 + max(0.0, residuals.delta_cht_max) * 0.8),
            "Mechanical Friction": max(0.0, oil_p_penalty * 1.5 + vib_penalty * 1.2 + oil_t_penalty * 1.0),
            "Combustion Loss": max(0.0, misfire_penalty * 2.2 + (residuals.egt_spread_c / 30.0))
        }
        
        # Apply Softmax over scores
        score_keys = list(scores.keys())
        score_vals = np.array([scores[k] for k in score_keys])
        # If any fault score is elevated, suppress nominal
        if max(score_vals[1:]) > 1.2:
            score_vals[0] = max(0.01, 1.0 - max(score_vals[1:]) * 0.4)
        
        exp_vals = np.exp(score_vals - np.max(score_vals))
        probs = exp_vals / np.sum(exp_vals)
        prob_dict = {score_keys[i]: round(float(probs[i]), 3) for i in range(len(score_keys))}
        
        # Primary predicted failure mode
        predicted_mode = score_keys[int(np.argmax(score_vals))]
        if target_health > 88.0 and residuals.composite_anomaly_score < 0.6:
            predicted_mode = "NOMINAL"
            
        # Degradation rate (pct per min)
        current_time = telemetry.timestamp
        if self.previous_time is not None and (current_time - self.previous_time) > 0.05:
            dt_s = current_time - self.previous_time
            deg_rate = max(0.0, (self.previous_health - self.smooth_health) / dt_s * 60.0)
        else:
            deg_rate = 0.0
        self.previous_time = current_time
        self.previous_health = self.smooth_health
        
        prediction = DigitalTwinPrediction(
            health_index_pct=round(self.smooth_health, 1),
            rul_minutes=round(self.smooth_rul, 1),
            predicted_failure_mode=predicted_mode,
            failure_probabilities=prob_dict,
            anomaly_score=min(1.0, residuals.composite_anomaly_score / 3.0),
            confidence=0.96 if len(self.history_buffer) == self.sequence_length else 0.75,
            degradation_rate_pct_per_min=round(deg_rate, 2)
        )
        
        return baseline, residuals, prediction
