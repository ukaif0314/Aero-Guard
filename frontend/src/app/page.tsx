"use client";

import React from "react";
import { MinimalistDashboard } from "../components/MinimalistDashboard";

export default function GroundControlStationDashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start selection:bg-cyan-500 selection:text-slate-950">
      <MinimalistDashboard />
    </main>
  );
}
