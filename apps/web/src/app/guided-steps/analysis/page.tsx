"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import AssetSunburst from "@/components/AssetSunburst";
import RelativeMomentumChart from "@/components/RelativeMomentumChart";
import StockDiscovery from "@/components/StockDiscovery";
import { fetchNormalizedComparison } from "@/lib/api";
import {
  PieChart,
  ArrowRight,
  Lock,
  ChevronRight,
  Info,
} from "lucide-react";

export default function StocksAnalysisStep() {
  const { canContinue, recommendation } = useApp();

  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [normalizedData, setNormalizedData] = useState<any>(null);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    if (recommendation?.recommended_stocks?.length) {
      const initial = recommendation.recommended_stocks.slice(0, 4).map((s) => s.ticker);
      setSelectedTickers(initial);
    }
  }, [recommendation]);

  useEffect(() => {
    if (!selectedTickers.length) {
      setNormalizedData(null);
      return;
    }

    let isMounted = true;
    async function loadComparison() {
      setLoadingChart(true);
      try {
        const data = await fetchNormalizedComparison(selectedTickers);
        if (isMounted) setNormalizedData(data);
      } catch (e) {
        console.error("Failed to load normalized comparison", e);
      } finally {
        if (isMounted) setLoadingChart(false);
      }
    }

    loadComparison();
    return () => {
      isMounted = false;
    };
  }, [selectedTickers]);

  const handleToggleTicker = (ticker: string) => {
    setSelectedTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  // Gatekeeper check: If Step 1 or Step 2 incomplete
  if (!canContinue || !recommendation) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="finovate-card p-8 sm:p-10 text-center max-w-lg mx-auto flex flex-col items-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">Step 2 Recommendations Required</h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Detailed asset allocation sunbursts and normalized momentum charts require your personalized AI portfolio recommendations.
            </p>
          </div>
          <Link
            href="/guided-steps/recommendations"
            className="finovate-btn-primary py-3 px-6 text-xs sm:text-sm"
          >
            <span>Generate Recommendations in Step 2</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="finovate-badge-green mb-2">
          <span>Step 03 of 04</span>
          <span>•</span>
          <span>Portfolio Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Portfolio Dynamics & Equity Analytics
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Inspect your target multi-asset distribution and compare normalized 14-day price trajectories from a standardized 0.0% Day 0 baseline.
        </p>
      </div>

      {/* Module 1: Multi-Asset Target Allocation */}
      <div className="finovate-card p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-2.5">
            <PieChart size={18} className="text-[#047857]" />
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
              Target Asset Allocation Breakdown
            </h3>
          </div>
          <div className="finovate-badge-green">
            <span>100% Capital Deployed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sunburst Chart */}
          <div className="lg:col-span-5 flex justify-center">
            <AssetSunburst
              allocations={recommendation.target_asset_allocation}
              strategyTier={recommendation.risk_profile}
              confidence={recommendation.confidence}
            />
          </div>

          {/* Allocation Breakdown Details */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(recommendation.target_asset_allocation).map(([assetName, pct]) => (
                <div
                  key={assetName}
                  className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-semibold text-[#0F172A] block truncate">
                      {assetName}
                    </span>
                    <span className="text-[11px] text-[#64748B]">Target Allocation</span>
                  </div>
                  <span className="text-sm font-bold finovate-mono text-[#047857] tabular-nums flex-shrink-0">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] flex items-start space-x-2">
              <Info size={15} className="text-[#047857] flex-shrink-0 mt-0.5" />
              <span>
                Periodic rebalancing (quarterly or semi-annually) restores these target weights when equity returns diverge from fixed income or gold reserves.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Relative Momentum Alpha Comparison */}
      <div className="space-y-6">
        {/* Momentum Chart */}
        <RelativeMomentumChart data={normalizedData} loading={loadingChart} />

        {/* Stock Discovery Ticker Selector */}
        <StockDiscovery
          selectedTickers={selectedTickers}
          onToggleTicker={handleToggleTicker}
        />
      </div>

      {/* Bottom CTA to Step 4 */}
      <div className="p-6 finovate-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Expand Your Financial Knowledge</h4>
          <p className="text-xs text-[#64748B] mt-0.5">
            Access curated masterclasses and investing principles from leading Indian market educators.
          </p>
        </div>

        <Link
          href="/guided-steps/resources"
          className="finovate-btn-primary py-3 px-6 text-xs sm:text-sm flex-shrink-0"
        >
          <span>Proceed to Step 4: Learning Center</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
