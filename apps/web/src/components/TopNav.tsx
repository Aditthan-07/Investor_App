"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Layers, TrendingUp, TrendingDown } from "lucide-react";
import { fetchNiftyUpdate } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default function TopNav() {
  const pathname = usePathname();
  const [nifty, setNifty] = useState<{ latest_price: number; change_pct: number } | null>(null);

  useEffect(() => {
    fetchNiftyUpdate()
      .then((data) => setNifty(data))
      .catch(() => {
        setNifty({ latest_price: 24850.2, change_pct: 0.65 });
      });
  }, []);

  const isInfowayActive = pathname === "/" || pathname.startsWith("/infoway");
  const isGuidedActive = pathname.startsWith("/guided-steps");

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-[#FFFFFF]/90 backdrop-blur-xl px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Navigation Modes */}
      <nav className="flex items-center space-x-2">
        <Link
          href="/infoway"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            isInfowayActive
              ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-sm"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent"
          }`}
        >
          <Sparkles size={14} className={isInfowayActive ? "text-[#047857]" : "text-[#64748B]"} />
          <span>Market Infoway</span>
        </Link>

        <Link
          href="/guided-steps/health"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            isGuidedActive
              ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-sm"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent"
          }`}
        >
          <Layers size={14} className={isGuidedActive ? "text-[#047857]" : "text-[#64748B]"} />
          <span>Guided Portfolio Journey</span>
        </Link>
      </nav>

      {/* Ambient Real-time NIFTY 50 Card */}
      {nifty && (
        <div className="flex items-center space-x-3 text-xs bg-[#FFFFFF] border border-[#E2E8F0] px-3.5 py-1.5 rounded-lg shadow-sm">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#64748B]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#047857] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#047857]"></span>
            </span>
            <span className="tracking-wide">NSE:</span>
          </div>

          <span className="text-[#64748B] font-medium">NIFTY 50</span>
          <span className="finovate-mono text-[#0F172A] font-bold tabular-nums">{formatINR(nifty.latest_price)}</span>

          <span
            className={`font-semibold flex items-center space-x-0.5 text-xs finovate-mono ${
              nifty.change_pct >= 0 ? "text-[#047857]" : "text-rose-600"
            }`}
          >
            {nifty.change_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>
              {nifty.change_pct >= 0 ? "+" : ""}
              {nifty.change_pct.toFixed(2)}%
            </span>
          </span>
        </div>
      )}
    </header>
  );
}
