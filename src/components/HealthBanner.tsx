"use client";

import React from "react";
import { 
  Timer, 
  ShieldCheck, 
  Flame, 
  Zap, 
  Cog 
} from "lucide-react";
import { DigitalTwinPrediction, PhysicsResidualsOutput } from "../types/telemetry";

interface HealthBannerProps {
  prediction: DigitalTwinPrediction | null;
  residuals: PhysicsResidualsOutput | null;
  activeFault: string;
}

export const HealthBanner: React.FC<HealthBannerProps> = ({
  prediction,
  residuals,
  activeFault,
}) => {
  const health = prediction?.health_index_pct ?? 100.0;
  const rul = prediction?.rul_minutes ?? 540.0;
  const failureMode = prediction?.predicted_failure_mode ?? "NOMINAL";
  const probs = prediction?.failure_probabilities ?? {
    "NOMINAL": 1.0,
    "Thermal Overheat": 0.0,
    "Mechanical Friction": 0.0,
    "Combustion Loss": 0.0
  };

  const isCritical = health < 45.0 || rul < 30.0;
  const isWarning = !isCritical && (health < 80.0 || rul < 180.0);

  const statusColor = isCritical
    ? "text-red-400 border-red-500/40 bg-red-950/30"
    : isWarning
    ? "text-amber-400 border-amber-500/40 bg-amber-950/30"
    : "text-emerald-400 border-emerald-500/40 bg-emerald-950/30";

  const glowClass = isCritical
    ? "glow-red"
    : isWarning
    ? "glow-amber"
    : "glow-emerald";

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health / 100) * circumference;

  const rulTextClass = isCritical
    ? "text-red-400 animate-pulse"
    : isWarning
    ? "text-amber-300"
    : "text-cyan-300";

  const rulIconBoxClass = isCritical
    ? "bg-red-900/40 text-red-400 animate-pulse"
    : isWarning
    ? "bg-amber-900/40 text-amber-400"
    : "bg-cyan-900/40 text-cyan-400";

  const gaugeStrokeClass = isCritical
    ? "text-red-500"
    : isWarning
    ? "text-amber-400"
    : "text-emerald-400";

  const modeBadgeColor = failureMode === "NOMINAL"
    ? "text-emerald-400"
    : "text-amber-400 animate-pulse";

  const modeIconBoxClass = failureMode === "Thermal Overheat"
    ? "bg-orange-950/60 text-orange-400"
    : failureMode === "Mechanical Friction"
    ? "bg-red-950/60 text-red-400"
    : failureMode === "Combustion Loss"
    ? "bg-purple-950/60 text-purple-400"
    : "bg-emerald-950/60 text-emerald-400";

  return (
    <div className={`w-full rounded-xl border p-4 backdrop-blur-md transition-all duration-300 ${statusColor} ${glowClass}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        
        {/* Module 1: Remaining Useful Life (RUL) Countdown */}
        <div className="flex items-center gap-4 bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className={`p-3 rounded-xl ${rulIconBoxClass}`}>
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Remaining Useful Life</span>
              <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] rounded text-slate-300">LSTM-PHM</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black font-mono tracking-tight ${rulTextClass}`}>
                {rul.toFixed(1)}
              </span>
              <span className="text-sm font-mono text-slate-400">MINS</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Degradation: <span className="text-slate-200 font-semibold">{prediction?.degradation_rate_pct_per_min.toFixed(1) ?? 0.0}% / min</span>
            </div>
          </div>
        </div>

        {/* Module 2: Health Index Circular Gauge */}
        <div className="flex items-center gap-4 bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-slate-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className={`transition-all duration-500 ${gaugeStrokeClass}`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-lg font-bold tracking-tighter text-slate-100">
                {health.toFixed(0)}%
              </span>
              <span className="text-[8px] text-slate-400 uppercase">HEALTH</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Health Status
            </div>
            <div className="text-base font-bold font-mono text-slate-200">
              {isCritical ? "CRITICAL SEVERITY" : isWarning ? "DEGRADED STATE" : "OPTIMAL HEALTH"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Anomaly Dist: <span className="text-cyan-300 font-semibold">{(residuals?.composite_anomaly_score ?? 0.0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Module 3: Primary Failure Mode Classification */}
        <div className="flex items-center gap-3 bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className={`p-3 rounded-xl ${modeIconBoxClass}`}>
            {failureMode === "Thermal Overheat" ? <Flame className="w-6 h-6" /> :
             failureMode === "Mechanical Friction" ? <Cog className="w-6 h-6" /> :
             failureMode === "Combustion Loss" ? <Zap className="w-6 h-6" /> :
             <ShieldCheck className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Classified Failure Mode
            </div>
            <div className={`text-sm font-bold font-mono truncate uppercase ${modeBadgeColor}`}>
              {failureMode}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              Trigger: <span className="text-slate-300 font-semibold">{activeFault === "NONE" ? "None (Nominal)" : activeFault}</span>
            </div>
          </div>
        </div>

        {/* Module 4: Neural Prognostics Multi-Class Probabilities */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>PHM Softmax Logits</span>
            <span className="text-cyan-400 font-bold">{((prediction?.confidence ?? 0.95) * 100).toFixed(0)}% Conf</span>
          </div>
          <div className="space-y-1 text-[10px]">
            {Object.entries(probs).map(([key, val]) => {
              const barColor = key === "NOMINAL"
                ? "bg-emerald-400"
                : key === "Thermal Overheat"
                ? "bg-orange-400"
                : key === "Mechanical Friction"
                ? "bg-red-400"
                : "bg-purple-400";

              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 truncate w-24">{key.replace("Thermal ", "Th.").replace("Mechanical ", "Mech.")}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, val * 100))}%` }}
                    />
                  </div>
                  <span className="text-slate-300 w-8 text-right font-semibold">{(val * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
