"use client";

import React, { useState } from "react";
import { 
  Plane, 
  CheckCircle2, 
  Flame, 
  Droplet, 
  Activity, 
  Clock, 
  ShieldCheck,
  Cpu
} from "lucide-react";

export type DroneKey = "TAPAS" | "RUSTOM" | "NISHANT";
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

interface DroneProfile {
  id: DroneKey;
  name: string;
  code: string;
  engineModel: string;
  engineSpecs: string;
  circumstances: Record<CircumstanceKey, CircumstanceData>;
}

const DRONE_FLEET: Record<DroneKey, DroneProfile> = {
  TAPAS: {
    id: "TAPAS",
    name: "Tapas",
    code: "TAPAS-01",
    engineModel: "Rotax 914 F Turbo",
    engineSpecs: "4 Cylinders • 1.35L Turbo • Safe: <135°C, >1.5 bar",
    circumstances: {
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
        tempStatus: "Safe (<135°C Limit)",
        tempBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        oil: "4.2 bar",
        oilStatus: "Safe (>1.5 bar Min)",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Smooth",
        vibStatus: "No shaking",
        vibBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        whatHappened: "The Rotax engine is running smoothly. Air, fuel, cooling water, and oil are all in perfect condition.",
        systemAction: "Keep flying on the current route at normal speed.",
        benefit: "The drone will finish its entire 24-hour mission safely."
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
        tempStatus: "Danger High (>135°C Limit)",
        tempBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
        oil: "3.9 bar",
        oilStatus: "Okay",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Normal",
        vibStatus: "Slight heat expansion",
        vibBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        whatHappened: "Cooling water leaked out of the radiator. Without water cooling, cylinder heads are heating up past safe limits.",
        systemAction: "Slow down the throttle to 55% so cold outside air cools the engine down.",
        benefit: "Gives the pilot +35 more minutes of flying time to reach an alternate runway."
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
        oilStatus: "Critical Low (<1.5 bar Min)",
        oilBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
        vib: "Heavy Shaking",
        vibStatus: "Metal rubbing on metal",
        vibBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
        whatHappened: "An oil line leaked and oil pressure collapsed. Metal bearings are rubbing directly against crankshaft with heavy friction.",
        systemAction: "Immediately cut engine power to 30% and glide down to land on the nearest runway.",
        benefit: "Prevents the engine from seizing in mid-air and saves the $15M aircraft."
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
        timeDesc: "Running on 3 cylinders with loss of power",
        timeLeftColor: "text-indigo-600",
        healthPercent: 65,
        healthLabel: "65% Needs Attention",
        healthBarColor: "bg-indigo-500",
        temp: "88°C",
        tempStatus: "Cylinder 3 spark dead",
        tempBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
        oil: "4.1 bar",
        oilStatus: "Safe & Normal",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Shaking",
        vibStatus: "Engine is jerking",
        vibBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
        whatHappened: "Cylinder 3 spark plug stopped firing. The engine is shaking because only 3 cylinders are pushing the propeller.",
        systemAction: "Switch to the backup ignition channel to restart the spark plug.",
        benefit: "Restores full 115 HP engine power and stops the shaking."
      }
    }
  },
  RUSTOM: {
    id: "RUSTOM",
    name: "Rustom",
    code: "RUSTOM-02",
    engineModel: "Lycoming O-320",
    engineSpecs: "4 Cylinders • 5.2L Air-Cooled • Safe: <240°C, >2.0 bar",
    circumstances: {
      NORMAL: {
        id: "NORMAL",
        buttonLabel: "Normal Flight",
        buttonSub: "Cruising nominally",
        badge: "HEALTHY",
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cardBorder: "border-emerald-200 ring-emerald-500/20",
        heroBg: "bg-gradient-to-b from-emerald-50/60 to-white",
        timeLeft: "8",
        timeUnit: "HOURS",
        timeDesc: "Full fuel range and nominal engine wear",
        timeLeftColor: "text-emerald-600",
        healthPercent: 100,
        healthLabel: "100% Healthy",
        healthBarColor: "bg-emerald-500",
        temp: "195°C",
        tempStatus: "Safe (<240°C Limit)",
        tempBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        oil: "4.8 bar",
        oilStatus: "Safe (>2.0 bar Min)",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Smooth",
        vibStatus: "Normal cruise",
        vibBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        whatHappened: "The Lycoming O-320 engine is operating within standard aeronautical parameters. All 4 cylinders burning evenly.",
        systemAction: "Maintain standard cruise altitude and heading.",
        benefit: "Ensures full mission completion with zero maintenance intervention."
      },
      COOLANT: {
        id: "COOLANT",
        buttonLabel: "Thermal Stress",
        buttonSub: "Cylinder 2 heat spike",
        badge: "OVERHEATING",
        badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
        cardBorder: "border-amber-300 ring-amber-500/20",
        heroBg: "bg-gradient-to-b from-amber-50/70 to-white",
        timeLeft: "35",
        timeUnit: "MINUTES",
        timeDesc: "Cylinder 2 exceeds 240°C maximum limit",
        timeLeftColor: "text-amber-600",
        healthPercent: 54,
        healthLabel: "54% Warning",
        healthBarColor: "bg-amber-500",
        temp: "255°C",
        tempStatus: "Danger High (>240°C Limit)",
        tempBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
        oil: "4.2 bar",
        oilStatus: "Acceptable",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Moderate",
        vibStatus: "Thermal imbalance",
        vibBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
        whatHappened: "Air baffle around Cylinder 2 came loose. Cylinder 2 is not receiving sufficient ram airflow and is overheating.",
        systemAction: "De-rate engine throttle by 20% and pitch nose down slightly to force cooling ram air.",
        benefit: "Drops Cylinder 2 temperature below 230°C and avoids piston crown melting."
      },
      OIL: {
        id: "OIL",
        buttonLabel: "Oil Starvation",
        buttonSub: "Oil pump pressure loss",
        badge: "DANGER - OIL LEAK",
        badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
        cardBorder: "border-rose-300 ring-rose-500/20",
        heroBg: "bg-gradient-to-b from-rose-50/70 to-white",
        timeLeft: "3",
        timeUnit: "MINUTES",
        timeDesc: "Severe oil pressure drop below 2.0 bar",
        timeLeftColor: "text-rose-600",
        healthPercent: 15,
        healthLabel: "15% Critical",
        healthBarColor: "bg-rose-500",
        temp: "220°C",
        tempStatus: "Friction heat",
        tempBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
        oil: "1.4 bar",
        oilStatus: "Critical Low (<2.0 bar Min)",
        oilBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
        vib: "Heavy Shaking",
        vibStatus: "Metal grinding",
        vibBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
        whatHappened: "Oil pump relief valve stuck open. Oil pressure collapsed from 4.8 bar to 1.4 bar, starving journal bearings.",
        systemAction: "Execute immediate glide landing and trim engine throttle to minimum idle.",
        benefit: "Prevents crankshaft seizure and ensures safe airframe recovery."
      },
      CYLINDER: {
        id: "CYLINDER",
        buttonLabel: "Cylinder Misfire",
        buttonSub: "Cylinder 2 intermittent spark",
        badge: "ENGINE STUTTER",
        badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
        cardBorder: "border-indigo-300 ring-indigo-500/20",
        heroBg: "bg-gradient-to-b from-indigo-50/70 to-white",
        timeLeft: "60",
        timeUnit: "MINUTES",
        timeDesc: "Magneto ignition fault on Cylinder 2",
        timeLeftColor: "text-indigo-600",
        healthPercent: 62,
        healthLabel: "62% Needs Attention",
        healthBarColor: "bg-indigo-500",
        temp: "160°C",
        tempStatus: "Cylinder 2 cold misfire",
        tempBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
        oil: "4.5 bar",
        oilStatus: "Safe & Normal",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Shaking",
        vibStatus: "Combustion knock",
        vibBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
        whatHappened: "Left magneto ignition lead for Cylinder 2 fouled. Engine is vibrating due to asymmetric cylinder power strokes.",
        systemAction: "Switch ignition key from BOTH to RIGHT magneto to isolate clean ignition circuit.",
        benefit: "Restores smooth 4-cylinder firing sequence and stabilizes flight."
      }
    }
  },
  NISHANT: {
    id: "NISHANT",
    name: "Nishant",
    code: "NISHANT-03",
    engineModel: "Rotary / Twin Benchmark",
    engineSpecs: "2 Rotors • High-RPM Wankel • Safe: <180°C, >1.8 bar",
    circumstances: {
      NORMAL: {
        id: "NORMAL",
        buttonLabel: "Normal Flight",
        buttonSub: "Tactical sortie nominal",
        badge: "HEALTHY",
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cardBorder: "border-emerald-200 ring-emerald-500/20",
        heroBg: "bg-gradient-to-b from-emerald-50/60 to-white",
        timeLeft: "6",
        timeUnit: "HOURS",
        timeDesc: "High-RPM rotary running at nominal balance",
        timeLeftColor: "text-emerald-600",
        healthPercent: 100,
        healthLabel: "100% Healthy",
        healthBarColor: "bg-emerald-500",
        temp: "155°C",
        tempStatus: "Safe (<180°C Limit)",
        tempBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        oil: "3.2 bar",
        oilStatus: "Safe (>1.8 bar Min)",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Smooth",
        vibStatus: "Balanced rotary motion",
        vibBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        whatHappened: "Twin rotary engine spinning smoothly at 6,500 RPM. Apex seal lubrication and cooling jackets optimal.",
        systemAction: "Continue tactical battlefield surveillance mission.",
        benefit: "Provides 100% planned surveillance time over target area."
      },
      COOLANT: {
        id: "COOLANT",
        buttonLabel: "Thermal Stress",
        buttonSub: "Dual housing overheat",
        badge: "OVERHEATING",
        badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
        cardBorder: "border-amber-300 ring-amber-500/20",
        heroBg: "bg-gradient-to-b from-amber-50/70 to-white",
        timeLeft: "20",
        timeUnit: "MINUTES",
        timeDesc: "Housing temperature exceeds 180°C limit",
        timeLeftColor: "text-amber-600",
        healthPercent: 45,
        healthLabel: "45% Warning",
        healthBarColor: "bg-amber-500",
        temp: "192°C",
        tempStatus: "Danger High (>180°C Limit)",
        tempBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
        oil: "2.8 bar",
        oilStatus: "Acceptable",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Moderate",
        vibStatus: "Housing thermal warpage",
        vibBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
        whatHappened: "Coolant pump belt slipped. Temperature in both rotary combustion chambers exceeded the 180°C safe threshold.",
        systemAction: "Reduce engine RPM from 6,500 to 5,200 and begin descent to lower, cooler ambient air.",
        benefit: "Stabilizes rotor temperature and buys +25 minutes to land."
      },
      OIL: {
        id: "OIL",
        buttonLabel: "Oil Starvation",
        buttonSub: "Apex seal lube loss",
        badge: "DANGER - OIL LEAK",
        badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
        cardBorder: "border-rose-300 ring-rose-500/20",
        heroBg: "bg-gradient-to-b from-rose-50/70 to-white",
        timeLeft: "1.5",
        timeUnit: "MINUTES",
        timeDesc: "Severe oil loss: apex seal destruction imminent",
        timeLeftColor: "text-rose-600",
        healthPercent: 8,
        healthLabel: "8% Critical",
        healthBarColor: "bg-rose-500",
        temp: "175°C",
        tempStatus: "High friction",
        tempBadgeStyle: "text-amber-800 bg-amber-50 border-amber-200",
        oil: "1.2 bar",
        oilStatus: "Critical Low (<1.8 bar Min)",
        oilBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
        vib: "Extreme Shaking",
        vibStatus: "Apex seals rubbing housing",
        vibBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200",
        whatHappened: "Oil metering pump failed. Rotary apex seals have lost all lubrication and are grinding against trochoid chamber walls.",
        systemAction: "Deploy recovery parachute or initiate emergency glide landing immediately.",
        benefit: "Saves airframe and payloads from total in-flight engine explosion."
      },
      CYLINDER: {
        id: "CYLINDER",
        buttonLabel: "Rotor Misfire",
        buttonSub: "Rotor 2 compression loss",
        badge: "ENGINE STUTTER",
        badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
        cardBorder: "border-indigo-300 ring-indigo-500/20",
        heroBg: "bg-gradient-to-b from-indigo-50/70 to-white",
        timeLeft: "40",
        timeUnit: "MINUTES",
        timeDesc: "Power reduced by 50% on single rotor",
        timeLeftColor: "text-indigo-600",
        healthPercent: 52,
        healthLabel: "52% Needs Attention",
        healthBarColor: "bg-indigo-500",
        temp: "120°C",
        tempStatus: "Rotor 2 incomplete burn",
        tempBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
        oil: "3.0 bar",
        oilStatus: "Safe & Normal",
        oilBadgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
        vib: "Heavy Pulsing",
        vibStatus: "Single-rotor torque pulses",
        vibBadgeStyle: "text-indigo-700 bg-indigo-50 border-indigo-200",
        whatHappened: "Secondary spark coil on Rotor 2 failed. Power output dropped 50% and engine is pulsing heavily.",
        systemAction: "Trim airspeed to best glide/endurance speed and turn back towards recovery base.",
        benefit: "Maintains flight control and avoids engine stall."
      }
    }
  }
};

export const MinimalistDashboard: React.FC = () => {
  const [selectedDroneKey, setSelectedDroneKey] = useState<DroneKey>("TAPAS");
  const [selectedCircumstanceKey, setSelectedCircumstanceKey] = useState<CircumstanceKey>("NORMAL");

  const currentDrone = DRONE_FLEET[selectedDroneKey];
  const data = currentDrone.circumstances[selectedCircumstanceKey];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 py-8 px-4 sm:px-6 font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Sleek Header with Drone Selector on Left, Engine Model on Right */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
          
          {/* Left: App title + The 3 Drone Names (Tapas, Rustom, Nishant) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Plane className="w-5 h-5 rotate-45" />
              </div>
              <div>
                <h1 className="text-base font-bold text-zinc-900 tracking-tight leading-tight">
                  AeroGuard Engine Monitor
                </h1>
                <p className="text-[11px] text-zinc-500 font-medium">
                  UAV Aero Piston Health Predictor
                </p>
              </div>
            </div>

            {/* The 3 Drone Selection Buttons (Tapas, Rustom, Nishant) */}
            <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200">
              {(["TAPAS", "RUSTOM", "NISHANT"] as DroneKey[]).map((key) => {
                const drone = DRONE_FLEET[key];
                const isActive = selectedDroneKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDroneKey(key);
                      // Keep the same circumstance or reset if desired
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? "bg-white text-blue-700 shadow-sm border border-zinc-200/80 font-extrabold" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50"
                    }`}
                  >
                    {drone.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Small Thing Showing the Engine Model */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <div className="text-right">
                <div className="text-[11px] font-bold text-zinc-800 leading-tight">
                  {currentDrone.engineModel}
                </div>
                <div className="text-[9px] text-zinc-500 font-medium leading-tight">
                  {currentDrone.code}
                </div>
              </div>
            </div>
          </div>

        </header>

        {/* 4 Clickable Circumstance Buttons for the Selected Drone */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Choose an Engine Situation for {currentDrone.name}:
            </label>
            <span className="text-[11px] text-zinc-400 font-medium">
              {currentDrone.engineSpecs}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(currentDrone.circumstances) as CircumstanceKey[]).map((key) => {
              const item = currentDrone.circumstances[key];
              const isSelected = selectedCircumstanceKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCircumstanceKey(key)}
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

        {/* Big Sleek White Hero Card: How Much Time We Have Left */}
        <main className={`p-6 sm:p-8 rounded-3xl border border-zinc-200 bg-white shadow-sm ${data.heroBg} space-y-6`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Time Left to Fly ({currentDrone.name})</span>
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

        {/* Clean Footer */}
        <footer className="text-center text-xs text-zinc-400 py-3">
          AeroGuard UAV Fleet Engine Health Monitor • {currentDrone.name} ({currentDrone.engineModel})
        </footer>

      </div>
    </div>
  );
};
