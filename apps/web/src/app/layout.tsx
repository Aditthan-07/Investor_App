import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "FinSight – Corporate Wealth Management & Portfolio Intelligence",
  description: "AI-driven financial health evaluation, quantitative risk profiling, and real-time Indian stock market intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-[#334155] antialiased font-sans flex min-h-screen selection:bg-[#047857]/15 selection:text-[#047857]">
        <AppProvider>
          {/* Persistent Left Sidebar: Corporate Wealth HUD */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC]">
            <TopNav />
            <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 lg:p-10 space-y-8">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
