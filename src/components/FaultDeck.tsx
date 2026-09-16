"use client";

import React, { useState } from "react";
import { 
  Flame, 
  Droplet, 
  Zap, 
  CheckCircle2, 
  RotateCcw, 
  Sliders
} from "lucide-react";

interface FaultDeckProps {
  activeFault: string;
  onInjectFault: (faultType: string, severity?: number) => void;
  onClearFault: () => void;
  onSetThrottle: (throttle: number) => void;
  onReset: () => void;
  currentThrottle: number;
}

export const FaultDeck: React.FC<FaultDeckProps> = ({
  activeFault,
  onInjectFault,
  onClearFault,
  onSetThrottle,
  onReset,
  currentThrottle,
}) => {
  const [throttleInput, setThrottleInput] = useState<number>(currentThrottle || 75);
  const [severityFactor, setSeverityFactor] = useState<number>(1.2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleThrottleChange = (val: number) => {
    setThrottleInput(val);
    onSetThrottle(val);
  };

  const handleInject = async (type: string) => {
    setIsSubmitting(true);
    if (type === "NONE") {
      onClearFault();
    } else {
      onInjectFault(type, severityFactor);
    }
    setTimeout(() => setIsSubmitting(false), 300);
  };

  const isNominal = activeFault === "NONE";
  const isCoolantLeak = activeFault === "COOLANT_LEAK";
  const isOilStarvation = activeFault === "OIL_STARVATION";
  const isMisfire = activeFault === "CYLINDER_MISFIRE";

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Tactical Testing & Fault Injection Control Deck
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">Active Fault:</span>
          <span className={`px-2 py-0.5 rounded font-bold uppercase ${
            isCoolantLeak ? "bg-orange-950 border border-orange-500 text-orange-400" :
            isOilStarvation ? "bg-red-950 border border-red-500 text-red-400 animate-pulse" :
            isMisfire ? "bg-purple-950 border border-purple-500 text-purple-400" :
            "bg-emerald-950 border border-emerald-700 text-emerald-400"
          }`}>
            {isNominal ? "NOMINAL BASELINE" : activeFault}
          </span>
        </div>
      </div>

      {/* 4 Interactive Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        
        {/* Scenario 1: Nominal */}
        <button
          disabled={isSubmitting}
          onClick={() => handleInject("NONE")}
          className={`flex flex-col p-3 rounded-lg border text-left font-mono transition-all duration-200 ${
            isNominal
              ? "bg-emerald-950/60 border-emerald-500/80 shadow-md shadow-emerald-950/40"
              : "bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              NOMINAL FLIGHT
            </span>
            <span className="text-[9px] px-1 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
              CLEAR
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 leading-tight">
            Restores 100% coolant flow, nominal oil pressure (4.2 bar) and balanced combustion.
          </p>
          <div className="text-[9px] text-emerald-400/80 mt-auto font-semibold">
            Status: Baseline Optimal
          </div>
        </button>

        {/* Scenario 2: Coolant Leak */}
        <button
          disabled={isSubmitting}
          onClick={() => handleInject("COOLANT_LEAK")}
          className={`flex flex-col p-3 rounded-lg border text-left font-mono transition-all duration-200 ${
            isCoolantLeak
              ? "bg-orange-950/60 border-orange-500/80 shadow-md shadow-orange-950/40"
              : "bg-slate-900/80 border-slate-800 hover:border-orange-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              COOLANT LEAK
            </span>
            <span className="text-[9px] px-1 py-0.5 bg-orange-950 text-orange-300 rounded border border-orange-800">
              THERMAL
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 leading-tight">
            Cooling capacity decays exponentially. CHT surges above 135 deg C risking head warp.
          </p>
          <div className="text-[9px] text-orange-400/80 mt-auto font-semibold">
            Trigger: Exponential CHT Runaway
          </div>
        </button>

        {/* Scenario 3: Oil Starvation */}
        <button
          disabled={isSubmitting}
          onClick={() => handleInject("OIL_STARVATION")}
          className={`flex flex-col p-3 rounded-lg border text-left font-mono transition-all duration-200 ${
            isOilStarvation
              ? "bg-red-950/60 border-red-500/80 shadow-md shadow-red-950/40 animate-pulse"
              : "bg-slate-900/80 border-slate-800 hover:border-red-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <Droplet className="w-4 h-4" />
              OIL STARVATION
            </span>
            <span className="text-[9px] px-1 py-0.5 bg-red-950 text-red-300 rounded border border-red-800">
              MECHANICAL
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 leading-tight">
            Oil pressure collapses below 1.2 bar. Bearing vibration surges above 10g.
          </p>
          <div className="text-[9px] text-red-400/80 mt-auto font-semibold">
            Trigger: Bearing Seizure Threat
          </div>
        </button>

        {/* Scenario 4: Cylinder 3 Misfire */}
        <button
          disabled={isSubmitting}
          onClick={() => handleInject("CYLINDER_MISFIRE")}
          className={`flex flex-col p-3 rounded-lg border text-left font-mono transition-all duration-200 ${
            isMisfire
              ? "bg-purple-950/60 border-purple-500/80 shadow-md shadow-purple-950/40"
              : "bg-slate-900/80 border-slate-800 hover:border-purple-500/40 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              CYLINDER 3 MISFIRE
            </span>
            <span className="text-[9px] px-1 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800">
              COMBUSTION
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 leading-tight">
            Cylinder 3 combustion drops (EGT below 400 deg C). Severe cyclic torque ripple.
          </p>
          <div className="text-[9px] text-purple-400/80 mt-auto font-semibold">
            Trigger: EGT Spread & Imbalance
          </div>
        </button>

      </div>

      {/* Throttle Control & Simulation Management */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 font-mono flex flex-wrap items-center justify-between gap-4">
        
        {/* Throttle Slider & Presets */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider">
              Autonomous Throttle Command (FADEC / Pilot Override)
            </span>
            <span className="font-bold text-cyan-300 text-sm">{throttleInput.toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={throttleInput}
            onChange={(e) => handleThrottleChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            <button
              onClick={() => handleThrottleChange(0)}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300"
            >
              IDLE (0%)
            </button>
            <button
              onClick={() => handleThrottleChange(55)}
              className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-700/40 hover:border-cyan-500 text-[10px] text-cyan-300"
            >
              DE-RATE (55%)
            </button>
            <button
              onClick={() => handleThrottleChange(75)}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300"
            >
              CRUISE (75%)
            </button>
            <button
              onClick={() => handleThrottleChange(100)}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300"
            >
              TAKEOFF (100%)
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Fault Severity Selector */}
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase">Fault Severity</span>
            <select
              value={severityFactor}
              onChange={(e) => setSeverityFactor(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-cyan-300 font-mono outline-none"
            >
              <option value="0.8">0.8x (Mild)</option>
              <option value="1.2">1.2x (Standard)</option>
              <option value="1.8">1.8x (Severe)</option>
            </select>
          </div>

          {/* Reset Mission Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-xs font-mono text-slate-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>RESET MISSION</span>
          </button>
        </div>

      </div>
    </div>
  );
};
