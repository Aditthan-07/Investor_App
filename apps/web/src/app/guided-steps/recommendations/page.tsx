"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Scale,
  Zap,
  ArrowUpRight,
  Lock,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function RecommendationsStep() {
  const {
    canContinue,
    riskTolerance,
    setRiskTolerance,
    recommendation,
    generateRecommendations,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateRecommendations();
      if (!res) {
        setError("Failed to generate portfolio recommendations. Please verify the backend service is running.");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while generating recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Gatekeeper check: If Step 1 incomplete
  if (!canContinue) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="finovate-card p-8 sm:p-10 text-center max-w-lg mx-auto flex flex-col items-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">Step 1 Required First</h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              To construct a risk-adjusted portfolio tailored to your situation, FinSight AI requires an evaluated financial health profile.
            </p>
          </div>
          <Link
            href="/guided-steps/health"
            className="finovate-btn-primary py-3 px-6 text-xs sm:text-sm"
          >
            <span>Complete Step 1: Financial Health</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  const RISK_TIERS = [
    {
      id: "Low",
      title: "Conservative",
      subtitle: "Capital Preservation",
      desc: "Focus on capital safety, government bonds, and sovereign gold with defensive blue-chip equities.",
      icon: Shield,
    },
    {
      id: "Medium",
      title: "Balanced",
      subtitle: "Wealth Accumulation",
      desc: "Balanced 65/35 growth mix with diversified Indian blue chips, index leaders, and fixed-income buffers.",
      icon: Scale,
    },
    {
      id: "High",
      title: "Aggressive",
      subtitle: "Maximum Compounding",
      desc: "High equity weighting targeting market-outperforming thematic sectors and growth-oriented leaders.",
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="finovate-badge-green mb-2">
          <span>Step 02 of 04</span>
          <span>•</span>
          <span>Algorithmic Allocation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Portfolio Recommendations & Strategy
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Select your target risk horizon. FinSight’s trained machine learning model evaluates your parameters
          and computes optimal weight allocations across top Indian equities and asset classes.
        </p>
      </div>

      {/* Risk Profile Selection Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
            <Sliders size={14} className="text-[#047857]" />
            <span>Select Target Risk Appetite</span>
          </label>
          <span className="text-xs text-[#94A3B8] font-medium">Model Input Parameter</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RISK_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isSelected = riskTolerance.toLowerCase() === tier.id.toLowerCase();
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setRiskTolerance(tier.id)}
                className={`p-5 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? "bg-[#ECFDF5] border-[#047857] text-[#0F172A] shadow-md shadow-[#047857]/5 ring-1 ring-[#047857]"
                    : "bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl border ${
                    isSelected
                      ? "bg-[#047857] text-white border-transparent"
                      : "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]"
                  }`}>
                    <Icon size={18} />
                  </div>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-[#047857] text-white">
                      <CheckCircle2 size={14} />
                    </span>
                  )}
                </div>
                <h3 className={`text-base font-bold ${isSelected ? "text-[#0F172A]" : "text-[#334155]"}`}>
                  {tier.title}
                </h3>
                <span className="text-xs font-semibold text-[#047857] block mb-2">{tier.subtitle}</span>
                <p className="text-xs text-[#64748B] leading-relaxed">{tier.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="finovate-btn-primary w-full sm:w-auto py-3 px-8 text-sm disabled:opacity-40"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                <span>Running Machine Learning Model...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Recommendations for {riskTolerance} Risk</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Recommendation Results Display */}
      {recommendation && (
        <div className="space-y-8 animate-fadeIn pt-2">
          {/* ML Summary Card */}
          <div className="finovate-card p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
                    AI Risk Profile Assessment
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-lg font-bold text-[#0F172A]">
                      {recommendation.risk_profile} Strategy
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] finovate-mono tabular-nums">
                      {(recommendation.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature Weights Matrix */}
              {recommendation.feature_importances && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#64748B] font-medium mr-1">Key Factors:</span>
                  {Object.entries(recommendation.feature_importances).map(([feat, weight]) => (
                    <div
                      key={feat}
                      className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] font-medium"
                    >
                      <span className="text-[#64748B]">{feat}: </span>
                      <span className="text-[#047857] font-bold finovate-mono tabular-nums">
                        {(weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Explanation Narrative */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs sm:text-sm text-[#334155] leading-relaxed">
              <span className="text-[#0F172A] font-bold block mb-1">Portfolio Strategy Rationale:</span>
              {recommendation.explanation}
            </div>
          </div>

          {/* Recommended Stock Research Panels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Recommended Asset Basket</h3>
                <p className="text-xs text-[#64748B]">
                  High-conviction liquid instruments aligned with your {recommendation.risk_profile} profile.
                </p>
              </div>
              <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-full border border-[#E2E8F0] finovate-mono">
                {recommendation.recommended_stocks.length} Selected Assets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendation.recommended_stocks.map((stock) => {
                const isPositive = stock.two_week_change_pct >= 0;
                const cleanTicker = stock.ticker.replace(".NS", "").replace(".BO", "");
                const growwUrl = `https://groww.in/stocks/${cleanTicker.toLowerCase()}`;

                return (
                  <div
                    key={stock.ticker}
                    className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#047857]/50 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all hover:shadow-lg group shadow-sm"
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Symbol, Exchange & Target Allocation */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold text-[#0F172A] group-hover:text-[#047857] transition-colors finovate-mono">
                            {cleanTicker}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B]">
                            NSE
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] finovate-mono tabular-nums">
                          {stock.allocation_pct}% Target
                        </span>
                      </div>

                      {/* Company Name & Asset Class */}
                      <div>
                        <h4 className="text-sm font-semibold text-[#0F172A] truncate">
                          {stock.company_name}
                        </h4>
                        <span className="text-xs text-[#64748B] block mt-0.5">
                          {stock.asset_class}
                        </span>
                      </div>

                      {/* Allocation Micro-Bar */}
                      <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#047857] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, stock.allocation_pct * 3)}%` }}
                        />
                      </div>

                      {/* Price & 2-Week Momentum */}
                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[11px] text-[#64748B] block">Current Price</span>
                          <span className="font-bold text-[#0F172A] finovate-mono text-sm tabular-nums">
                            {formatINR(stock.current_price)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-[#64748B] block">2-Week Trend</span>
                          <div
                            className={`flex items-center space-x-1 text-xs font-bold finovate-mono tabular-nums ${
                              isPositive ? "text-[#047857]" : "text-rose-600"
                            }`}
                          >
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>
                              {isPositive ? "+" : ""}
                              {stock.two_week_change_pct.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Broker Integration Action */}
                    <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                      <a
                        href={growwUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#047857] hover:text-[#065F46] flex items-center space-x-1 transition-colors"
                      >
                        <span>Trade on Groww</span>
                        <ArrowUpRight size={13} />
                      </a>

                      {stock.website_url && (
                        <a
                          href={stock.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#64748B] hover:text-[#0F172A] flex items-center space-x-1"
                        >
                          <span>Website</span>
                          <ArrowUpRight size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Advancement CTA */}
          <div className="p-6 finovate-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Ready to inspect multi-asset dynamics?</h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                Examine your target asset distribution sunburst and track relative momentum performance.
              </p>
            </div>

            <Link
              href="/guided-steps/analysis"
              className="finovate-btn-primary py-3 px-6 text-xs sm:text-sm flex-shrink-0"
            >
              <span>Proceed to Step 3: Portfolio Analysis</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
