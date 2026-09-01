import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRDO TAPAS-BH-201 | Aero Piston Engine Digital Twin GCS",
  description: "Tactical Ground Control Station & Real-Time Digital Twin for MALE UAV Aero Piston Engines (DRDO Problem Statement SIH26054)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
