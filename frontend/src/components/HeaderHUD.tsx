"use client";

import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  Plane, 
  Volume2, 
  VolumeX, 
  Clock,
  Play,
  Pause,
  StepForward,
  BookOpen
} from "lucide-react";
import { CombinedDigitalTwinFrame } from "../types/telemetry";

interface HeaderHUDProps {
  data: CombinedDigitalTwinFrame | null;
  isConnected: boolean;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
  packetCount: number;
  isPaused: boolean;
  onTogglePlayPause: () => void;
  onStepFrame: () => void;
  onOpenExplainer: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  data,
  isConnected,
  audioEnabled,
  setAudioEnabled,
  packetCount,
  isPaused,
  onTogglePlayPause,
  onStepFrame,
  onOpenExplainer,
}) => {
  const [utcTime, setUtcTime] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flightTimeFormatted = data
    ? `${Math.floor(data.flight_time_s / 60)
        .toString()
        .padStart(2, "0")}:${Math.floor(data.flight_time_s % 60)
        .toString()
        .padStart(2, "0")}.${Math.floor((data.flight_time_s % 1) * 10)}`
    : "00:00.0";

  const severity = data?.advisory?.severity || "NOMINAL";
  const isCritical = severity === "CRITICAL";
  const isWarning = severity === "WARNING";

  const flightModeText = isCritical
    ? "EMERGENCY RTB"
    : isWarning
    ? "DEGRADED CRUISE"
    : "AUTONOMOUS CRUISE";

  const flightModeColor = isCritical
    ? "text-red-400 animate-pulse"
    : isWarning
    ? "text-amber-400"
    : "text-emerald-400";

  const audioBtnClass = audioEnabled
    ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/60"
    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300";

  return (
    <header className="w-full bg-slate-950/90 border-b border-cyan-500/20 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 z-50 shadow-md">
      {/* Left: Project Branding & Powerplant */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-inner">
          <Plane className="w-5 h-5 rotate-45" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm tracking-wider text-cyan-400">
              AEROGUARD
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-semibold">
              DRDO TAPAS UAV • SIH26054
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>Rotax 914 Turbo Aero Piston (1.35L)</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">COLLEGE PROTOTYPE</span>
          </div>
        </div>
      </div>

      {/* Center: Play / Pause / Step Controls for Student Presentation */}
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl font-mono text-xs shadow-inner">
        <button
          onClick={onTogglePlayPause}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
            isPaused
              ? "bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm"
              : "bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm"
          }`}
          title={isPaused ? "Resume Live Telemetry Stream" : "Pause Stream (Freeze for Explanation)"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          <span>{isPaused ? "RESUME" : "PAUSE"}</span>
        </button>

        {isPaused && (
          <button
            onClick={onStepFrame}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500 text-[11px] font-semibold transition-all"
            title="Advance exactly 1 simulation frame (100ms)"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>STEP 1 FRAME</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <div className="flex items-center gap-1 px-2 text-[11px] text-slate-400">
          <span className="text-slate-500">MODE:</span>
          <span className={`font-bold ${flightModeColor}`}>{flightModeText}</span>
        </div>
      </div>

      {/* Right: College Defense Cheat-Sheet Button, UTC, Status & Audio */}
      <div className="flex items-center gap-3">
        
        {/* Project Guide / Defense Cheat-Sheet Drawer Button */}
        <button
          onClick={onOpenExplainer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-bold shadow-sm transition-all"
          title="Open Professor Q&A and Code Explanation Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>CODE & DEFENSE GUIDE</span>
        </button>

        {/* UTC Clock & MET */}
        <div className="text-right font-mono hidden md:block">
          <div className="text-xs text-slate-300 flex items-center justify-end gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{utcTime || "SYNCING..."}</span>
          </div>
          <div className="text-[11px] text-cyan-400/80">
            MET: <span className="font-bold text-cyan-300">{flightTimeFormatted}</span>
          </div>
        </div>

        {/* WebSocket Stream Indicator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs">
          {isConnected ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className={`w-2 h-2 rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isPaused ? "PAUSED" : "5Hz LIVE"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <WifiOff className="w-3.5 h-3.5" />
              <span className="text-[11px]">DISCONNECTED</span>
            </div>
          )}
          <span className="text-slate-500 text-[10px] border-l border-slate-800 pl-1.5">
            #{packetCount}
          </span>
        </div>

        {/* Audio Advisory Buzzer Toggle */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? "Mute Tactical Alarms" : "Enable Tactical Alarms"}
          className={`p-2 rounded-lg border transition-all ${audioBtnClass}`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
