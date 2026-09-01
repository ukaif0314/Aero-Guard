"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Activity } from "lucide-react";
import { CombinedDigitalTwinFrame } from "../types/telemetry";

interface TelemetryChartsProps {
  history: CombinedDigitalTwinFrame[];
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ history }) => {
  const [activeTab, setActiveTab] = useState<"CHT" | "EGT" | "LUBRICATION" | "VIBRATION" | "POWER">("CHT");

  const chartData = history.slice(-30).map((frame) => ({
    time: `${frame.flight_time_s.toFixed(1)}s`,
    flight_time: frame.flight_time_s,
    // CHT
    cht1: frame.telemetry.cht1,
    cht2: frame.telemetry.cht2,
    cht3: frame.telemetry.cht3,
    cht4: frame.telemetry.cht4,
    theo_cht: frame.physics_baseline.theo_cht_avg,
    // EGT
    egt1: frame.telemetry.egt1,
    egt2: frame.telemetry.egt2,
    egt3: frame.telemetry.egt3,
    egt4: frame.telemetry.egt4,
    theo_egt: frame.physics_baseline.theo_egt_avg,
    // Lubrication
    oil_pressure: frame.telemetry.oil_pressure_bar,
    oil_temp: frame.telemetry.oil_temp_c,
    theo_oil_p: frame.physics_baseline.theo_oil_pressure_bar,
    // Vibration
    vib_x: frame.telemetry.vibration_x_g,
    vib_y: frame.telemetry.vibration_y_g,
    vib_z: frame.telemetry.vibration_z_g,
    vib_rms: frame.telemetry.vibration_rms_g,
    // Power
    rpm: frame.telemetry.rpm,
    map: frame.telemetry.manifold_pressure_inhg,
    throttle: frame.telemetry.throttle_pct,
  }));

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
      {/* Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Telemetry & Physics Residual Analytics
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg font-mono text-xs">
          <button
            onClick={() => setActiveTab("CHT")}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === "CHT"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            CHT (4 Cyl)
          </button>
          <button
            onClick={() => setActiveTab("EGT")}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === "EGT"
                ? "bg-orange-950 text-orange-300 border border-orange-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            EGT (Exhaust)
          </button>
          <button
            onClick={() => setActiveTab("LUBRICATION")}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === "LUBRICATION"
                ? "bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Oil Pressure / Temp
          </button>
          <button
            onClick={() => setActiveTab("VIBRATION")}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === "VIBRATION"
                ? "bg-purple-950 text-purple-300 border border-purple-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            3-Axis Vibration
          </button>
          <button
            onClick={() => setActiveTab("POWER")}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === "POWER"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            RPM & MAP
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "CHT" ? (
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis domain={[80, 160]} stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} unit="°C" />
              <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px", color: "#e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
              <ReferenceLine y={135} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "CHT Critical Limit (135°C)", fill: "#ef4444", fontSize: 10 }} />
              <Line type="monotone" dataKey="cht1" stroke="#38bdf8" name="CHT 1" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="cht2" stroke="#f43f5e" name="CHT 2" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="cht3" stroke="#a855f7" name="CHT 3" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="cht4" stroke="#34d399" name="CHT 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="theo_cht" stroke="#94a3b8" strokeDasharray="5 5" name="Physics Baseline" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          ) : activeTab === "EGT" ? (
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis domain={[200, 950]} stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} unit="°C" />
              <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px", color: "#e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
              <ReferenceLine y={880} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "EGT Max (880°C)", fill: "#ef4444", fontSize: 10 }} />
              <Line type="monotone" dataKey="egt1" stroke="#fb923c" name="EGT 1" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="egt2" stroke="#f97316" name="EGT 2" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="egt3" stroke="#c084fc" name="EGT 3" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="egt4" stroke="#fde047" name="EGT 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="theo_egt" stroke="#94a3b8" strokeDasharray="5 5" name="Physics Baseline" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          ) : activeTab === "LUBRICATION" ? (
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis yAxisId="left" domain={[0, 6]} stroke="#38bdf8" tick={{ fontSize: 10, fill: "#38bdf8" }} unit=" bar" />
              <YAxis yAxisId="right" orientation="right" domain={[60, 150]} stroke="#f59e0b" tick={{ fontSize: 10, fill: "#f59e0b" }} unit="°C" />
              <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px", color: "#e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
              <ReferenceLine yAxisId="left" y={1.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Min Oil Pressure (1.5 bar)", fill: "#ef4444", fontSize: 10 }} />
              <Line yAxisId="left" type="monotone" dataKey="oil_pressure" stroke="#38bdf8" name="Oil Pressure (bar)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="theo_oil_p" stroke="#94a3b8" strokeDasharray="5 5" name="Theo Oil P (bar)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="oil_temp" stroke="#f59e0b" name="Oil Temp (°C)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          ) : activeTab === "VIBRATION" ? (
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis domain={[0, 16]} stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} unit=" g" />
              <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px", color: "#e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
              <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Vibration Alarm (4.5g)", fill: "#ef4444", fontSize: 10 }} />
              <Line type="monotone" dataKey="vib_rms" stroke="#ec4899" name="Composite RMS (g)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="vib_x" stroke="#38bdf8" name="Lateral X (g)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="vib_y" stroke="#a855f7" name="Longitudinal Y (g)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="vib_z" stroke="#fbbf24" name="Vertical Z (g)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis yAxisId="left" domain={[4000, 6200]} stroke="#34d399" tick={{ fontSize: 10, fill: "#34d399" }} unit=" RPM" />
              <YAxis yAxisId="right" orientation="right" domain={[20, 42]} stroke="#38bdf8" tick={{ fontSize: 10, fill: "#38bdf8" }} unit=" inHg" />
              <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px", color: "#e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
              <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#34d399" name="Engine Speed (RPM)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="map" stroke="#38bdf8" name="MAP (inHg)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="throttle" stroke="#f59e0b" strokeDasharray="3 3" name="Throttle (%)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
