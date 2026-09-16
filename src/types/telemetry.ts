export interface EngineTelemetry {
  timestamp: number;
  flight_time_s: number;
  rpm: number;
  throttle_pct: number;
  manifold_pressure_inhg: number;
  fuel_flow_lph: number;
  fuel_pressure_bar: number;
  cht1: number;
  cht2: number;
  cht3: number;
  cht4: number;
  cht_avg: number;
  cht_max: number;
  egt1: number;
  egt2: number;
  egt3: number;
  egt4: number;
  egt_avg: number;
  egt_max: number;
  oil_pressure_bar: number;
  oil_temp_c: number;
  coolant_temp_c: number;
  vibration_x_g: number;
  vibration_y_g: number;
  vibration_z_g: number;
  vibration_rms_g: number;
  altitude_ft: number;
  airspeed_kts: number;
  ambient_temp_c: number;
  active_fault: string;
  fault_elapsed_s: number;
}

export interface PhysicsBaselineOutput {
  theo_cht1: number;
  theo_cht2: number;
  theo_cht3: number;
  theo_cht4: number;
  theo_cht_avg: number;
  theo_egt1: number;
  theo_egt2: number;
  theo_egt3: number;
  theo_egt4: number;
  theo_egt_avg: number;
  theo_oil_pressure_bar: number;
  theo_oil_temp_c: number;
  theo_fuel_flow_lph: number;
  theo_vibration_rms_g: number;
}

export interface PhysicsResidualsOutput {
  delta_cht1: number;
  delta_cht2: number;
  delta_cht3: number;
  delta_cht4: number;
  delta_cht_avg: number;
  delta_cht_max: number;
  cht_spread_c: number;
  delta_egt1: number;
  delta_egt2: number;
  delta_egt3: number;
  delta_egt4: number;
  delta_egt_avg: number;
  egt_spread_c: number;
  delta_oil_pressure_bar: number;
  delta_oil_temp_c: number;
  delta_vibration_rms_g: number;
  composite_anomaly_score: number;
}

export interface DigitalTwinPrediction {
  health_index_pct: number;
  rul_minutes: number;
  predicted_failure_mode: string;
  failure_probabilities: Record<string, number>;
  anomaly_score: number;
  confidence: number;
  degradation_rate_pct_per_min: number;
}

export type AdvisorySeverity = "NOMINAL" | "WARNING" | "CRITICAL";

export interface TacticalAdvisory {
  severity: AdvisorySeverity;
  status_code: string;
  headline: string;
  action_directive: string;
  life_extension_estimate: string;
  recommended_throttle_limit_pct: number;
  root_cause: string;
  reasoning_trace: string;
  affected_subsystems: string[];
}

export interface CombinedDigitalTwinFrame {
  timestamp: number;
  flight_time_s: number;
  telemetry: EngineTelemetry;
  physics_baseline: PhysicsBaselineOutput;
  physics_residuals: PhysicsResidualsOutput;
  digital_twin: DigitalTwinPrediction;
  advisory: TacticalAdvisory;
  active_fault: string;
}
