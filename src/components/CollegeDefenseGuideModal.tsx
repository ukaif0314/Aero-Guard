"use client";

import React, { useState } from "react";
import { 
  X, 
  BookOpen, 
  Code2, 
  Layers, 
  HelpCircle, 
  Terminal, 
  Cpu
} from "lucide-react";

interface CollegeDefenseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "ARCHITECTURE" | "PHYSICS_FORMULAS" | "CODE_EXPLAINER" | "PROFESSOR_QA";

export const CollegeDefenseGuideModal: React.FC<CollegeDefenseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("ARCHITECTURE");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>COLLEGE PROJECT DEFENSE &amp; CODE WALKTHROUGH</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                  STUDENT CHEAT-SHEET
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Simple, plain-English answers for your professor and jury presentation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/30 px-6 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("ARCHITECTURE")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === "ARCHITECTURE"
                ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. System Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab("CODE_EXPLAINER")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === "CODE_EXPLAINER"
                ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Why Python &amp; JavaScript?</span>
          </button>
          <button
            onClick={() => setActiveTab("PHYSICS_FORMULAS")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === "PHYSICS_FORMULAS"
                ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. Simple Math &amp; Formulas</span>
          </button>
          <button
            onClick={() => setActiveTab("PROFESSOR_QA")}
            className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === "PROFESSOR_QA"
                ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>4. Top Professor Q&amp;A</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-6 text-slate-300">
          
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === "ARCHITECTURE" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h3 className="text-cyan-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> What does this project do in 1 sentence?
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  &quot;It is a digital simulator and health monitor for an aircraft piston engine that predicts when parts will break before an accident happens.&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-cyan-400 font-bold block text-sm">Backend (Python / FastAPI)</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">simulator.py:</strong> Calculates engine physics (RPM, temperature, oil pressure) 10 times every second.</li>
                    <li><strong className="text-slate-200">digital_twin.py:</strong> Computes expected temperatures and calculates the difference (Delta).</li>
                    <li><strong className="text-slate-200">advisory.py:</strong> Suggests flight emergency commands (e.g. reduce throttle to 55%).</li>
                    <li><strong className="text-slate-200">main.py:</strong> Serves the REST API and sends live data over WebSockets to the UI.</li>
                  </ul>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-cyan-400 font-bold block text-sm">Frontend (Next.js / React / Tailwind)</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">page.tsx:</strong> The main dashboard screen that receives WebSocket messages.</li>
                    <li><strong className="text-slate-200">HeaderHUD:</strong> Top bar showing airspeed, altitude, and Play/Pause controls.</li>
                    <li><strong className="text-slate-200">CylinderThermalGrid:</strong> 4 progress bars showing heat on each cylinder head.</li>
                    <li><strong className="text-slate-200">TelemetryCharts:</strong> Live line graphs using Recharts.</li>
                    <li><strong className="text-slate-200">FaultDeck:</strong> Interactive buttons to test faults (Coolant leak, Oil drop).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE EXPLAINER */}
          {activeTab === "CODE_EXPLAINER" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-cyan-300 font-bold text-sm">
                  Why did you choose Python for the backend?
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  &quot;We chose <strong>Python 3</strong> with <strong>FastAPI</strong> because Python has the best scientific math libraries (<code className="text-cyan-400">numpy</code>, <code className="text-cyan-400">math</code>) for thermodynamic calculations. FastAPI is asynchronous and lightweight, which allows us to stream 10Hz engine telemetry over WebSockets without blocking the CPU.&quot;
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-cyan-300 font-bold text-sm">
                  Why did you choose JavaScript / Next.js / React for the frontend?
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  &quot;We chose <strong>Next.js 15 with React</strong> because ground control stations require a reactive user interface where individual widgets (like gauges, graphs, and warning terminals) can update independently without refreshing the entire page. <strong>Tailwind CSS</strong> provides clean military HUD styling, and <strong>Recharts</strong> renders smooth streaming graphs.&quot;
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-cyan-300 font-bold text-sm">
                  How does the Frontend communicate with the Backend?
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  &quot;Through a persistent <strong>WebSocket connection (<code className="text-cyan-400">ws://localhost:8000/ws/telemetry</code>)</strong>. Unlike traditional HTTP where the browser repeatedly polls the server, WebSockets keep a permanent two-way pipe open. The backend pushes a new JSON telemetry packet every 200 milliseconds (5Hz), and the React state instantly updates the UI.&quot;
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PHYSICS FORMULAS */}
          {activeTab === "PHYSICS_FORMULAS" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-cyan-300 font-bold text-sm">
                  1. The Physics Residual Formula (How Digital Twin works)
                </h4>
                <div className="bg-black/60 p-3 rounded-lg border border-cyan-500/30 text-cyan-400 font-mono text-sm">
                  Delta_CHT = Sensor_Temperature - Expected_Physics_Temperature
                </div>
                <p className="text-slate-400 text-xs">
                  • If <strong>Delta is near 0°C (+/- 2°C)</strong>: Engine is healthy (even during high-power climbs).<br/>
                  • If <strong>Delta &gt; +15°C</strong>: Heat is accumulating faster than normal physics allows (Coolant Leak detected).
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-cyan-300 font-bold text-sm">
                  2. Remaining Useful Life (RUL) Formula
                </h4>
                <div className="bg-black/60 p-3 rounded-lg border border-cyan-500/30 text-cyan-400 font-mono text-sm">
                  RUL (mins) = (Critical_Limit - Current_Value) / Rate_of_Change_per_Minute
                </div>
                <p className="text-slate-400 text-xs">
                  • <strong>Nominal flight:</strong> Degradation is negligible (RUL is ~600 mins).<br/>
                  • <strong>Oil starvation:</strong> Oil pressure drops at 0.5 bar/sec (RUL drops to 1.0 minute).
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-cyan-300 font-bold text-sm">
                  3. The 4 Failure Modes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/40 p-2.5 rounded border border-slate-800">
                    <strong className="text-emerald-400">1. Nominal Baseline:</strong> All 4 cylinders at ~100°C, Oil P ~4.2 bar, Vib ~2.1g.
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-amber-800">
                    <strong className="text-amber-400">2. Coolant Leak:</strong> Water pump/radiator loss causes CHT to climb past 135°C.
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-red-800">
                    <strong className="text-red-400">3. Oil Starvation:</strong> Oil pump pressure drops &lt; 1.5 bar, bearing friction spikes vibration &gt; 10g.
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-purple-800">
                    <strong className="text-purple-400">4. Cylinder 3 Misfire:</strong> Fuel injector or spark fails on Cylinder 3; EGT drops &lt; 400°C.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOP PROFESSOR Q&A */}
          {activeTab === "PROFESSOR_QA" && (
            <div className="space-y-4">
              
              <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Q: &quot;Did you build this with AI or by yourself?&quot;</span>
                </div>
                <div className="bg-black/50 p-3 rounded-lg text-slate-200 text-xs leading-relaxed border-l-2 border-cyan-400">
                  <strong>Say this:</strong> &quot;Professor, we used modern AI coding assistants for syntax auto-completion and UI styling speed, but the <strong>engineering architecture, 1D thermodynamic formulas, physics delta calculations, and flight advisory rules were derived and coded by our team</strong>. We built this as a prototype to solve DRDO Problem Statement SIH26054.&quot;
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Q: &quot;What if a sensor wire breaks rather than the engine failing?&quot;</span>
                </div>
                <div className="bg-black/50 p-3 rounded-lg text-slate-200 text-xs leading-relaxed border-l-2 border-amber-400">
                  <strong>Say this:</strong> &quot;We use <strong>multi-sensor cross-validation</strong>. If only one thermocouple wire breaks, its reading spikes instantaneously, but adjacent cylinder temperatures, oil temperature, and engine vibration remain completely normal. The system identifies this as an <em>isolated sensor fault</em> and prevents a false mission abort.&quot;
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Q: &quot;How does your advisory system help the pilot or autopilot?&quot;</span>
                </div>
                <div className="bg-black/50 p-3 rounded-lg text-slate-200 text-xs leading-relaxed border-l-2 border-emerald-400">
                  <strong>Say this:</strong> &quot;Traditional dashboards just beep when it is too late. Our advisory engine calculates exact life-extension actions. For example, if a coolant leak is detected, it commands: <em>&apos;De-rate throttle to 55% for ram-air cooling&apos;</em>, extending engine life by <strong>+35 minutes</strong> so the drone can reach an alternate runway.&quot;
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400">
            Tip: Keep this guide open in a second tab or refer to it if asked technical questions!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all"
          >
            GOT IT / CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
