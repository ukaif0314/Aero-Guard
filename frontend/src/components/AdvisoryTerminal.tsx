"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Compass, 
  TrendingUp, 
  Layers,
  ChevronRight
} from "lucide-react";
import { TacticalAdvisory } from "../types/telemetry";

interface AdvisoryTerminalProps {
  advisory: TacticalAdvisory | null;
}

interface LogEntry {
  id: string;
  time: string;
  severity: string;
  text: string;
}

export const AdvisoryTerminal: React.FC<AdvisoryTerminalProps> = ({ advisory }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const lastDirectiveRef = useRef<string>("");
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!advisory) return;

    if (advisory.action_directive !== lastDirectiveRef.current) {
      lastDirectiveRef.current = advisory.action_directive;
      const now = new Date();
      const timeStr = now.toTimeString().substring(0, 8);

      setLogs((prev) => [
        ...prev.slice(-40),
        {
          id: `${Date.now()}-${Math.random()}`,
          time: timeStr,
          severity: advisory.severity,
          text: `[${advisory.status_code}] ${advisory.action_directive} | Trace: ${advisory.reasoning_trace}`,
        },
      ]);
    }
  }, [advisory]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const severity = advisory?.severity || "NOMINAL";
  const isCritical = severity === "CRITICAL";
  const isWarning = severity === "WARNING";

  const cardGlowClass = isCritical
    ? "bg-red-950/20 border-red-500/50 glow-red"
    : isWarning
    ? "bg-amber-950/20 border-amber-500/50 glow-amber"
    : "bg-slate-950/80 border-slate-800";

  const badgeClass = isCritical
    ? "bg-red-900/60 border border-red-500 text-red-300 animate-pulse"
    : isWarning
    ? "bg-amber-900/60 border border-amber-500 text-amber-300"
    : "bg-emerald-950 border border-emerald-700/60 text-emerald-400";

  const directiveBoxClass = isCritical
    ? "bg-red-950/60 border-red-500 shadow-md shadow-red-950"
    : isWarning
    ? "bg-amber-950/50 border-amber-500/80"
    : "bg-cyan-950/30 border-cyan-500/30";

  const directiveTextClass = isCritical
    ? "text-red-300 animate-pulse"
    : isWarning
    ? "text-amber-200"
    : "text-cyan-200";

  const hasSubsystems = (advisory?.affected_subsystems?.length ?? 0) > 0;

  return (
    <div className={`w-full rounded-xl border p-4 backdrop-blur-md transition-all duration-300 ${cardGlowClass}`}>
      {/* Terminal Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Autonomous Tactical Flight Advisory & Action Directives
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 ${badgeClass}`}>
            {isCritical ? <AlertOctagon className="w-3 h-3" /> :
             isWarning ? <AlertTriangle className="w-3 h-3" /> :
             <CheckCircle2 className="w-3 h-3" />}
            {severity} ALERT
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            AUTONOMOUS AGENT ACTIVE
          </span>
        </div>
      </div>

      {/* Primary Action Directive Banner */}
      <div className={`rounded-lg p-3.5 border mb-3 transition-all ${directiveBoxClass}`}>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
          <span>Target FCS Directive</span>
          <span className="text-cyan-400 font-semibold">{advisory?.status_code ?? "NOM_OK"}</span>
        </div>
        <div className={`font-mono font-black text-sm sm:text-base leading-snug tracking-wide uppercase ${directiveTextClass}`}>
          {advisory?.action_directive ?? "MAINTAIN CRUISE PROFILE - ALL SYSTEMS NOMINAL"}
        </div>
      </div>

      {/* Secondary Metrics & Reasoning Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 font-mono text-xs">
        {/* Metric 1: Life Extension */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Estimated Life Extension</span>
          </div>
          <div className="font-bold text-emerald-300 text-xs truncate">
            {advisory?.life_extension_estimate ?? "Standard Life Cycle (>500h)"}
          </div>
        </div>

        {/* Metric 2: Throttle Cap Recommendation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Recommended Throttle Cap</span>
          </div>
          <div className="font-bold text-cyan-300 text-xs">
            MAX {advisory?.recommended_throttle_limit_pct.toFixed(0) ?? 100}% THROTTLE
          </div>
        </div>

        {/* Metric 3: Subsystems Impacted */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Degraded Subsystems</span>
          </div>
          <div className="flex flex-wrap gap-1 text-[9px]">
            {hasSubsystems ? (
              advisory!.affected_subsystems.map((sub, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-amber-950/80 border border-amber-700/50 text-amber-300 rounded">
                  {sub}
                </span>
              ))
            ) : (
              <span className="text-slate-400">All Systems Nominal</span>
            )}
          </div>
        </div>
      </div>

      {/* Root Cause & Diagnostic Chain */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
          Root Cause Physical Diagnosis
        </div>
        <div className="text-slate-300 text-[11px] mb-2 leading-relaxed">
          {advisory?.root_cause ?? "Thermodynamic and hydrodynamic conditions within design envelope."}
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
          Active Diagnostic Reasoning Chain
        </div>
        <div className="text-cyan-300/90 text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800/80 leading-relaxed font-mono">
          {advisory?.reasoning_trace ?? "Telemetric values match 1D thermodynamic Otto baseline."}
        </div>
      </div>

      {/* Scrollable Tactical Event Log */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px]">
        <div className="text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Flight Advisory Decision Log</span>
          <span className="text-slate-600">{logs.length} entries</span>
        </div>
        <div className="h-24 overflow-y-auto space-y-1.5 pr-1">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Listening for advisory directives...</div>
          ) : (
            logs.map((l) => {
              const logColor = l.severity === "CRITICAL" ? "text-red-400" :
                l.severity === "WARNING" ? "text-amber-400" : "text-emerald-400";
              return (
                <div key={l.id} className="flex items-start gap-1.5 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-slate-500 shrink-0">[{l.time}]</span>
                  <span className={`font-semibold shrink-0 ${logColor}`}>
                    [{l.severity}]
                  </span>
                  <span className="text-slate-300 truncate">{l.text}</span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
