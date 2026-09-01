"use client";

import React, { useState } from "react";
import { 
  Flame, 
  Droplet, 
  Wind, 
  Cpu, 
  Info, 
  HelpCircle,
  X
} from "lucide-react";
import { EngineTelemetry, PhysicsResidualsOutput } from "../types/telemetry";

interface EngineSubsystemsInspectorProps {
  telemetry: EngineTelemetry | null;
  residuals: PhysicsResidualsOutput | null;
  activeFault: string;
}

type SubsystemKey = "CYLINDERS" | "LUBRICATION" | "COOLING" | "TURBO";

interface SubsystemDetail {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  whatItDoes: string;
  normalRange: string;
  failureSign: string;
  studentDefenseNote: string;
}

export const EngineSubsystemsInspector: React.FC<EngineSubsystemsInspectorProps> = ({
  telemetry,
  residuals,
  activeFault,
}) => {
  const [selectedSystem, setSelectedSystem] = useState<SubsystemKey | null>(null);

  const avgCht = telemetry
    ? ((telemetry.cht1 + telemetry.cht2 + telemetry.cht3 + telemetry.cht4) / 4).toFixed(1)
    : "100.5";
  const avgEgt = telemetry
    ? ((telemetry.egt1 + telemetry.egt2 + telemetry.egt3 + telemetry.egt4) / 4).toFixed(0)
    : "815";
  const oilPress = telemetry ? telemetry.oil_pressure_bar.toFixed(2) : "4.20";
  const oilTemp = telemetry ? telemetry.oil_temp_c.toFixed(1) : "92.0";
  const mapInhg = telemetry ? telemetry.manifold_pressure_inhg.toFixed(1) : "31.5";
  const rpm = telemetry ? telemetry.rpm : 5000;

  const isOilCritical = (telemetry?.oil_pressure_bar ?? 4.0) < 1.5;
  const isThermalHigh = parseFloat(avgCht) > 130.0;
  const isCylMisfire = activeFault === "CYLINDER_MISFIRE";

  const details: Record<SubsystemKey, SubsystemDetail> = {
    CYLINDERS: {
      title: "4 Combustion Chambers (Cylinders 1-4)",
      subtitle: "Air-Fuel Combustion & Head Temperatures",
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      color: "border-orange-500/50 bg-orange-950/20",
      whatItDoes: "Four pistons burn aviation gasoline (avgas) in an Otto 4-stroke cycle. CHT (Cylinder Head Temp) measures the aluminum metal heat; EGT (Exhaust Gas Temp) measures the burned exhaust gases leaving the valves.",
      normalRange: "CHT: 90°C to 125°C | EGT: 760°C to 840°C | CHT Spread < 15°C",
      failureSign: "If CHT > 135°C, metal softens and cylinder head warps. If EGT drops < 450°C, the spark plug or injector failed (misfire).",
      studentDefenseNote: "Professor, each cylinder has a dual sensor (thermocouple). We calculate expected heat based on air mass and throttle. If one cylinder is colder than the rest, it indicates a misfire; if all are overheating, coolant has failed."
    },
    LUBRICATION: {
      title: "Oil Lubrication & Crankcase Chamber",
      subtitle: "Crankshaft Journal Bearings & Oil Pump",
      icon: <Droplet className="w-5 h-5 text-red-400" />,
      color: "border-red-500/50 bg-red-950/20",
      whatItDoes: "An engine-driven oil pump circulates pressurized aero oil through micro-channels in the crankshaft, connecting rods, and camshafts. It creates a microscopic hydrodynamic oil film preventing metal-on-metal friction.",
      normalRange: "Oil Pressure: 3.0 to 5.0 bar (Nominal ~4.2 bar) | Oil Temp: 80°C to 110°C",
      failureSign: "If pressure collapses below 1.5 bar, the oil film vanishes within seconds. Metal scuffs against metal, vibration spikes above 10g, and the engine seizes permanently.",
      studentDefenseNote: "Professor, hydrodynamic wedge pressure is modeled mathematically as fluid viscosity times RPM. When an oil line punctures, pressure collapses and vibration spikes instantly."
    },
    COOLING: {
      title: "Liquid Cooling Jacket & Radiator",
      subtitle: "Closed-Loop Coolant Circuit + Ram Air",
      icon: <Wind className="w-5 h-5 text-cyan-400" />,
      color: "border-cyan-500/50 bg-cyan-950/20",
      whatItDoes: "A water/glycol mixture is pumped through water jackets wrapping the hottest upper cylinder heads. Heated coolant passes through the UAV forward radiator where outside ram air cools it down.",
      normalRange: "Coolant Heat Dissipation: 100% Flow | Delta CHT: +/-2.0°C",
      failureSign: "If coolant leaks, cooling drops to zero. Cylinder head heat builds exponentially until head gaskets blow and pistons melt.",
      studentDefenseNote: "Professor, theoretical cooling is modeled via convective heat transfer: Q = h * A * (T_head - T_coolant). In a leak, h_coolant drops to air-only levels, which our physics delta catches immediately."
    },
    TURBO: {
      title: "Turbocharger & Manifold Air System",
      subtitle: "Exhaust Turbine & Boost Manifold Pressure",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      color: "border-purple-500/50 bg-purple-950/20",
      whatItDoes: "Exhaust gases spin a turbine wheel that compresses incoming thin ambient air at high altitude, maintaining sea-level engine power up to 24,000 feet.",
      normalRange: "Manifold Pressure (MAP): 25 to 38 inHg (Turbo boost active) | RPM: 4800 to 5800",
      failureSign: "Wastegate stuck or turbo boost leak causes loss of manifold pressure and engine stalls at high altitude.",
      studentDefenseNote: "Professor, MAP directly determines mass airflow into the cylinders (m_dot = V_d * RPM * MAP / 2RT). As you move the throttle slider, MAP rises from 20 inHg to 38 inHg."
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
      
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive Engine Subsystems Explorer (Click to Inspect & Defend)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          SELECT ANY COMPONENT TO VIEW COLLEGE-LEVEL DEFENSE NOTES
        </span>
      </div>

      {/* 4 Interactive Pinterest-Style Subsystem Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Cylinders */}
        <button
          onClick={() => setSelectedSystem("CYLINDERS")}
          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
            selectedSystem === "CYLINDERS"
              ? "bg-orange-950/40 border-orange-400 shadow-md ring-1 ring-orange-400"
              : isThermalHigh || isCylMisfire
              ? "bg-orange-950/30 border-orange-500/70"
              : "bg-slate-900/80 border-slate-800 hover:border-orange-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 font-mono">
              <Flame className="w-4 h-4" />
              <span>4 CYLINDERS</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
              CHT/EGT
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300 mb-1">
            Avg CHT: <strong className="text-cyan-300">{avgCht}°C</strong> | EGT: <strong className="text-orange-300">{avgEgt}°C</strong>
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Combustion chambers burning fuel. Delta CHT: +{residuals?.cht_spread_c.toFixed(1) ?? "2.1"}°C spread.
          </p>
          <div className="text-[9px] text-cyan-400 mt-2 font-mono flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Click for explanation
          </div>
        </button>

        {/* Card 2: Lubrication */}
        <button
          onClick={() => setSelectedSystem("LUBRICATION")}
          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
            selectedSystem === "LUBRICATION"
              ? "bg-red-950/40 border-red-400 shadow-md ring-1 ring-red-400"
              : isOilCritical
              ? "bg-red-950/40 border-red-500/80 animate-pulse"
              : "bg-slate-900/80 border-slate-800 hover:border-red-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 font-mono">
              <Droplet className="w-4 h-4" />
              <span>OIL CHAMBER</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              PRESSURE
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300 mb-1">
            Pressure: <strong className={isOilCritical ? "text-red-400 animate-pulse" : "text-cyan-300"}>{oilPress} bar</strong> | Temp: <strong className="text-amber-300">{oilTemp}°C</strong>
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Crankshaft hydrodynamic oil film. Minimum safe threshold: 1.5 bar.
          </p>
          <div className="text-[9px] text-cyan-400 mt-2 font-mono flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Click for explanation
          </div>
        </button>

        {/* Card 3: Cooling */}
        <button
          onClick={() => setSelectedSystem("COOLING")}
          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
            selectedSystem === "COOLING"
              ? "bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-400"
              : isThermalHigh
              ? "bg-amber-950/30 border-amber-500/60"
              : "bg-slate-900/80 border-slate-800 hover:border-cyan-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
              <Wind className="w-4 h-4" />
              <span>COOLANT & RAM AIR</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              THERMAL
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300 mb-1">
            Status: <strong className={activeFault === "COOLANT_LEAK" ? "text-orange-400" : "text-emerald-400"}>{activeFault === "COOLANT_LEAK" ? "LEAK ACTIVE" : "NOMINAL FLOW"}</strong>
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Closed-loop water/glycol jacket + forward UAV ram-air radiator convective cooling.
          </p>
          <div className="text-[9px] text-cyan-400 mt-2 font-mono flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Click for explanation
          </div>
        </button>

        {/* Card 4: Turbo */}
        <button
          onClick={() => setSelectedSystem("TURBO")}
          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
            selectedSystem === "TURBO"
              ? "bg-purple-950/40 border-purple-400 shadow-md ring-1 ring-purple-400"
              : "bg-slate-900/80 border-slate-800 hover:border-purple-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 font-mono">
              <Cpu className="w-4 h-4" />
              <span>TURBO & MAP</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              BOOST
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300 mb-1">
            MAP: <strong className="text-purple-300">{mapInhg} inHg</strong> | RPM: <strong className="text-cyan-300">{rpm}</strong>
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Turbocharger wastegate and intake manifold absolute pressure regulator.
          </p>
          <div className="text-[9px] text-cyan-400 mt-2 font-mono flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Click for explanation
          </div>
        </button>

      </div>

      {/* Expanded Explainer Card (When a card is clicked) */}
      {selectedSystem && (
        <div className={`mt-3 p-4 rounded-xl border transition-all ${details[selectedSystem].color} relative animate-in fade-in duration-200`}>
          <button
            onClick={() => setSelectedSystem(null)}
            className="absolute top-3 right-3 p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            {details[selectedSystem].icon}
            <div>
              <h4 className="font-mono text-sm font-bold text-slate-100">
                {details[selectedSystem].title}
              </h4>
              <div className="text-[11px] font-mono text-slate-400">
                {details[selectedSystem].subtitle}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs my-2.5">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Physical Function</span>
              <p className="text-slate-300 text-[11px] leading-snug">{details[selectedSystem].whatItDoes}</p>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Normal Operating Range</span>
              <p className="text-emerald-300 text-[11px] font-semibold">{details[selectedSystem].normalRange}</p>
              <span className="text-[10px] text-slate-500 uppercase block mt-1.5 mb-0.5">Failure Indicator</span>
              <p className="text-red-300 text-[10px]">{details[selectedSystem].failureSign}</p>
            </div>
            <div className="bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/40">
              <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-0.5">🎯 What to Tell Your Professor</span>
              <p className="text-cyan-200 text-[11px] leading-snug">{details[selectedSystem].studentDefenseNote}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
