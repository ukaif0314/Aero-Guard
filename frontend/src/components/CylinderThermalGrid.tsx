"use client";

import React from "react";
import { Thermometer } from "lucide-react";
import { EngineTelemetry, PhysicsResidualsOutput, PhysicsBaselineOutput } from "../types/telemetry";

interface CylinderThermalGridProps {
  telemetry: EngineTelemetry | null;
  residuals: PhysicsResidualsOutput | null;
  baseline: PhysicsBaselineOutput | null;
}

export const CylinderThermalGrid: React.FC<CylinderThermalGridProps> = ({
  telemetry,
  residuals,
  baseline,
}) => {
  if (!telemetry) return null;

  const isChtSpreadHigh = (residuals?.cht_spread_c ?? 0) >= 20.0;
  const isEgtSpreadHigh = (residuals?.egt_spread_c ?? 0) >= 60.0;

  const cylinders = [
    {
      id: 1,
      name: "CYLINDER #1",
      cht: telemetry.cht1,
      egt: telemetry.egt1,
      dCht: residuals?.delta_cht1 ?? 0,
      dEgt: residuals?.delta_egt1 ?? 0,
      theoCht: baseline?.theo_cht1 ?? 105,
      theoEgt: baseline?.theo_egt1 ?? 810,
    },
    {
      id: 2,
      name: "CYLINDER #2",
      cht: telemetry.cht2,
      egt: telemetry.egt2,
      dCht: residuals?.delta_cht2 ?? 0,
      dEgt: residuals?.delta_egt2 ?? 0,
      theoCht: baseline?.theo_cht2 ?? 108,
      theoEgt: baseline?.theo_egt2 ?? 820,
    },
    {
      id: 3,
      name: "CYLINDER #3",
      cht: telemetry.cht3,
      egt: telemetry.egt3,
      dCht: residuals?.delta_cht3 ?? 0,
      dEgt: residuals?.delta_egt3 ?? 0,
      theoCht: baseline?.theo_cht3 ?? 107,
      theoEgt: baseline?.theo_egt3 ?? 818,
    },
    {
      id: 4,
      name: "CYLINDER #4",
      cht: telemetry.cht4,
      egt: telemetry.egt4,
      dCht: residuals?.delta_cht4 ?? 0,
      dEgt: residuals?.delta_egt4 ?? 0,
      theoCht: baseline?.theo_cht4 ?? 104,
      theoEgt: baseline?.theo_egt4 ?? 808,
    },
  ];

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            4-Cylinder Thermal & Combustion Schematic (Rotax 914 Turbo)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-400">
            CHT Spread: <strong className={isChtSpreadHigh ? "text-amber-400" : "text-cyan-300"}>{residuals?.cht_spread_c.toFixed(1) ?? "--"}°C</strong>
          </span>
          <span className="text-slate-400">
            EGT Spread: <strong className={isEgtSpreadHigh ? "text-red-400" : "text-cyan-300"}>{residuals?.egt_spread_c.toFixed(1) ?? "--"}°C</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cylinders.map((cyl) => {
          const isOverheat = cyl.cht >= 132.0;
          const isWarningCht = !isOverheat && cyl.cht >= 122.0;
          const isMisfire = cyl.egt <= 550.0;
          const isHighDeltaCht = cyl.dCht >= 8.0;
          const isHighDeltaEgt = Math.abs(cyl.dEgt) >= 40.0;

          const cardBgClass = isOverheat
            ? "bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/50"
            : isMisfire
            ? "bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50"
            : isWarningCht
            ? "bg-amber-950/30 border-amber-500/50"
            : "bg-slate-900/80 border-slate-800 hover:border-slate-700";

          const chtTextClass = isOverheat
            ? "text-red-400"
            : isWarningCht
            ? "text-amber-300"
            : "text-cyan-300";

          const chtBarClass = isOverheat
            ? "bg-gradient-to-r from-amber-500 to-red-500"
            : isWarningCht
            ? "bg-amber-400"
            : "bg-cyan-400";

          const egtBarClass = isMisfire
            ? "bg-purple-500"
            : "bg-gradient-to-r from-amber-500 to-orange-500";

          return (
            <div key={cyl.id} className={`rounded-lg border p-3 font-mono transition-all duration-300 ${cardBgClass}`}>
              {/* Cylinder Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-200 tracking-wide">
                  {cyl.name}
                </span>
                {isMisfire ? (
                  <span className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-500 text-[9px] text-purple-300 font-bold animate-pulse">
                    FLAMEOUT / MISFIRE
                  </span>
                ) : isOverheat ? (
                  <span className="px-1.5 py-0.5 rounded bg-red-900/60 border border-red-500 text-[9px] text-red-300 font-bold animate-pulse">
                    OVERHEAT
                  </span>
                ) : isWarningCht ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-500 text-[9px] text-amber-300 font-bold">
                    ELEVATED
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700/50 text-[9px] text-emerald-400">
                    NOMINAL
                  </span>
                )}
              </div>

              {/* CHT Section */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 text-[10px] uppercase">Cylinder Head (CHT)</span>
                  <span className={`font-bold ${chtTextClass}`}>
                    {cyl.cht.toFixed(1)}°C
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${chtBarClass}`}
                    style={{ width: `${Math.min(100, Math.max(5, ((cyl.cht - 60) / 100) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Theo: {cyl.theoCht.toFixed(1)}°C</span>
                  <span className={isHighDeltaCht ? "text-amber-400 font-semibold" : "text-slate-400"}>
                    Δ {cyl.dCht >= 0 ? `+${cyl.dCht.toFixed(1)}` : cyl.dCht.toFixed(1)}°C
                  </span>
                </div>
              </div>

              {/* EGT Section */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 text-[10px] uppercase">Exhaust Gas (EGT)</span>
                  <span className={`font-bold ${isMisfire ? "text-purple-300 animate-pulse" : "text-orange-300"}`}>
                    {cyl.egt.toFixed(0)}°C
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${egtBarClass}`}
                    style={{ width: `${Math.min(100, Math.max(5, ((cyl.egt - 200) / 750) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Theo: {cyl.theoEgt.toFixed(0)}°C</span>
                  <span className={isHighDeltaEgt ? "text-red-400 font-semibold" : "text-slate-400"}>
                    Δ {cyl.dEgt >= 0 ? `+${cyl.dEgt.toFixed(0)}` : cyl.dEgt.toFixed(0)}°C
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
