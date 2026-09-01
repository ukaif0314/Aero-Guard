"use client";

import React, { useState } from "react";
import { 
  Plane, 
  CheckCircle2, 
  Flame, 
  Droplet, 
  Activity, 
  Clock, 
  ShieldCheck
} from "lucide-react";

export type CircumstanceKey = "NORMAL" | "COOLANT" | "OIL" | "CYLINDER";

interface CircumstanceData {
  id: CircumstanceKey;
  buttonLabel: string;
  buttonSub: string;
  badge: string;
  badgeStyle: string;
  cardBorder: string;
  heroBg: string;
  timeLeft: string;
  timeUnit: string;
  timeDesc: string;
  timeLeftColor: string;
  healthPercent: number;
  healthLabel: string;
  healthBarColor: string;
  temp: string;
  tempStatus: string;
  tempBadgeStyle: string;
  oil: string;
  oilStatus: string;
  oilBadgeStyle: string;
  vib: string;
  vibStatus: string;
  vibBadgeStyle: string;
  whatHappened: string;
  systemAction: string;
  benefit: string;
}

const CIRCUMSTANCES: Record<CircumstanceKey, CircumstanceData> = {
  NORMAL: {
    id: "NORMAL",
    buttonLabel: "Normal Flight",
    buttonSub: "Everything working fine",
    badge: "HEALTHY",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cardBorder: "border-emerald-200 ring-emerald-500/20",
    heroBg: "bg-gradient-to-b from-emerald-50/60 to-white",
    timeLeft: "10",
    timeUnit: "HOURS",
    timeDesc: "Plenty of safe flight time remaining",
    timeLeftColor: "text-emerald-600",
    healthPercent: 100,
    healthLabel: "100% Healthy",
    healthBarColor: "bg-emerald-500",
    temp: "102°C",
    tempStatus: "Safe & Normal",
    tempBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
    oil: "4.2 bar",
    oilStatus: "Safe & Normal",
    oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
    vib: "Smooth",
    vibStatus: "No shaking",
    vibBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
    whatHappened: "The engine is running smoothly. Air, fuel, cooling water, and oil are all in perfect condition.",
    systemAction: "Keep flying on the current route at normal speed.",
    benefit: "The drone will finish its entire mission safely."
  },
  COOLANT: {
    id: "COOLANT",
    buttonLabel: "Coolant Leak",
    buttonSub: "Engine is getting too hot",
    badge: "OVERHEATING",
    badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
    cardBorder: "border-amber-300 ring-amber-500/20",
    heroBg: "bg-gradient-to-b from-amber-50/70 to-white",
    timeLeft: "45",
    timeUnit: "MINUTES",
    timeDesc: "Heat is rising fast without cooling water",
    timeLeftColor: "text-amber-600",
    healthPercent: 58,
    healthLabel: "58% Warning",
    healthBarColor: "bg-amber-500",
    temp: "138°C",
    tempStatus: "Too Hot (Above limit)",
    tempBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
    oil: "3.9 bar",
    oilStatus: "Okay",
    oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
    vib: "Normal",
    vibStatus: "Slight heat expansion",
    vibBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
    whatHappened: "Cooling water leaked out of the radiator. Without water cooling, the engine metal is heating up quickly.",
    systemAction: "Slow down the throttle to 55% so cold outside air cools the engine down.",
    benefit: "Gives the pilot +35 more minutes of flying time to land safely."
  },
  OIL: {
    id: "OIL",
    buttonLabel: "Oil Starvation",
    buttonSub: "Oil is leaking / Low pressure",
    badge: "DANGER - OIL LEAK",
    badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
    cardBorder: "border-rose-300 ring-rose-500/20",
    heroBg: "bg-gradient-to-b from-rose-50/70 to-white",
    timeLeft: "2",
    timeUnit: "MINUTES",
    timeDesc: "Engine parts will jam very soon without oil",
    timeLeftColor: "text-rose-600",
    healthPercent: 12,
    healthLabel: "12% Critical",
    healthBarColor: "bg-rose-500",
    temp: "118°C",
    tempStatus: "Friction heating up",
    tempBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
    oil: "1.1 bar",
    oilStatus: "Dangerously Low",
    oilBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
    vib: "Heavy Shaking",
    vibStatus: "Metal rubbing on metal",
    vibBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
    whatHappened: "An oil pipe leaked and oil pressure dropped. Metal parts are rubbing directly against metal with heavy friction.",
    systemAction: "Immediately cut engine power to 30% and glide down to land on the nearest runway.",
    benefit: "Prevents the engine from jamming in mid-air and saves the aircraft."
  },
  CYLINDER: {
    id: "CYLINDER",
    buttonLabel: "Cylinder Misfire",
    buttonSub: "1 cylinder stopped working",
    badge: "ENGINE STUTTER",
    badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
    cardBorder: "border-indigo-300 ring-indigo-500/20",
    heroBg: "bg-gradient-to-b from-indigo-50/70 to-white",
    timeLeft: "90",
    timeUnit: "MINUTES",
    timeDesc: "Running on only 3 cylinders with loss of power",
    timeLeftColor: "text-indigo-600",
    healthPercent: 65,
    healthLabel: "65% Needs Attention",
    healthBarColor: "bg-indigo-500",
    temp: "88°C",
    tempStatus: "Cylinder 3 is cold",
    tempBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
    oil: "4.1 bar",
    oilStatus: "Safe & Normal",
    oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
    vib: "Shaking",
    vibStatus: "Engine is jerking",
    vibBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
    whatHappened: "Cylinder 3 spark plug stopped working. The engine is shaking because only 3 cylinders are pushing.",
    systemAction: "Switch to the backup ignition switch to restart the spark plug.",
    benefit: "Restores full engine power and stops the shaking."
  }
};

export const MinimalistDashboard: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<CircumstanceKey>("NORMAL");
  const data = CIRCUMSTANCES[selectedKey];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 py-8 px-4 sm:px-6 font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Simple Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                AeroGuard Engine Monitor
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                UAV Aero Piston Engine Health System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Interactive Prototype
            </span>
          </div>
        </header>

        {/* 4 Clickable Circumstance Buttons */}
        <section className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
            Choose an Engine Situation:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(CIRCUMSTANCES) as CircumstanceKey[]).map((key) => {
              const item = CIRCUMSTANCES[key];
              const isSelected = selectedKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 relative ${
                    isSelected
                      ? `bg-white ${item.cardBorder} ring-2 shadow-md`
                      : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="font-bold text-sm text-zinc-900 leading-snug">
                    {item.buttonLabel}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                    {item.buttonSub}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Big Clean Hero Card: How Much Time We Have Left */}
        <main className={`p-6 sm:p-8 rounded-3xl border border-zinc-200 bg-white shadow-sm ${data.heroBg} space-y-6`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Time Left to Fly</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl sm:text-6xl font-black tracking-tight ${data.timeLeftColor}`}>
                  {data.timeLeft}
                </span>
                <span className="text-xl font-bold text-zinc-700">
                  {data.timeUnit}
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-medium mt-1">
                {data.timeDesc}
              </p>
            </div>

            <div className="sm:w-64 bg-white/90 p-4 rounded-2xl border border-zinc-200/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                <span>Engine Health</span>
                <span className={data.timeLeftColor}>{data.healthLabel}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full ${data.healthBarColor}`} 
                  style={{ width: `${data.healthPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {data.whatHappened}
              </p>
            </div>
          </div>

          {/* 3 Simple Physical Readings (Static, Zero moving numbers) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Heat */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Engine Heat
                </span>
                <span className="text-sm font-bold text-zinc-900">{data.temp}</span>
              </div>
              <div className="text-[11px]">
                <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${data.tempBadgeStyle}`}>
                  {data.tempStatus}
                </span>
              </div>
            </div>

            {/* Oil */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-rose-500" />
                  Oil Pressure
                </span>
                <span className="text-sm font-bold text-zinc-900">{data.oil}</span>
              </div>
              <div className="text-[11px]">
                <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${data.oilBadgeStyle}`}>
                  {data.oilStatus}
                </span>
              </div>
            </div>

            {/* Vibration */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Vibration
                </span>
                <span className="text-sm font-bold text-zinc-900">{data.vib}</span>
              </div>
              <div className="text-[11px]">
                <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${data.vibBadgeStyle}`}>
                  {data.vibStatus}
                </span>
              </div>
            </div>

          </div>

          {/* Clean Action Box: What the Health Monitoring System tells the pilot to do */}
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>What the Health Monitoring System tells the pilot to do:</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
              <p className="text-base font-bold text-blue-950 leading-relaxed">
                {data.systemAction}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-600 font-medium px-1">
              <span>Result:</span>
              <span className="font-bold text-emerald-700">{data.benefit}</span>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-zinc-400 py-3">
          AeroGuard UAV Engine Health Monitor • College Prototype
        </footer>

      </div>
    </div>
  );
};
