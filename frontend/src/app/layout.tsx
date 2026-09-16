import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroGuard | DRDO UAV Aero Piston Engine Fleet Digital Twin",
  description: "Tactical Health Monitor & Real-Time Digital Twin for DRDO Tapas, Rustom, and Nishant UAV Engines",
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
