"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import FinancialHealthRadar from "@/components/FinancialHealthRadar";
import { formatINR } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Lock,
  Unlock,
  Wallet,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function FinancialHealthStep() {
  const {
    profile,
    updateProfile,
    health,
    evaluateHealth,
    canContinue,
    isLocked,
    unlockHackerOverride,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCreditScoreTier = (score: number | null) => {
    if (score === null) return { label: "Not Calibrated", color: "text-[#64748B]", bg: "bg-[#F1F5F9] border-[#E2E8F0]" };
    if (score < 550) return { label: "Poor (<550)", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" };
    if (score < 700) return { label: "Fair (550-699)", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    if (score < 750) return { label: "Good (700-749)", color: "text-[#B45309]", bg: "bg-[#FFFBEB] border-[#FDE68A]" };
    return { label: "Excellent (750+)", color: "text-[#047857]", bg: "bg-[#ECFDF5] border-[#A7F3D0]" };
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (profile.salary === null || profile.salary <= 0) {
      setErrorMessage("Please enter your net annual salary.");
      return;
    }
    if (profile.creditScore === null) {
      setErrorMessage("Please set your credit score using the slider.");
      return;
    }
    if (profile.emergencyFund === null) {
      setErrorMessage("Please specify whether you have an emergency fund of at least 3 months.");
      return;
    }

    setLoading(true);
    try {
      const res = await evaluateHealth();
      if (!res) {
        setErrorMessage("Health evaluation could not be completed. Please check your connection.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during evaluation.");
    } finally {
      setLoading(false);
    }
  };

  const creditDetails = getCreditScoreTier(profile.creditScore);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="finovate-badge-green mb-2">
          <span>Step 01 of 04</span>
          <span>•</span>
          <span>Solvency Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Financial Health Audit
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          FinSight evaluates personal solvency, debt leverage, and emergency cash reserves to construct a secure capital foundation before equity allocation.
        </p>
      </div>

      {/* Main Grid: Form on Left, Radar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleEvaluate}
            className="finovate-card p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                <Wallet size={16} className="text-[#047857]" />
                <span>Financial Parameters</span>
              </span>
              <span className="text-xs text-[#64748B]">Pristine Canvas (Zero Defaults)</span>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Annual Salary Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#334155]">
                  Annual In-Hand Salary (INR)
                </label>
                {profile.salary !== null && profile.salary > 0 && (
                  <span className="text-xs font-bold finovate-mono text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] tabular-nums">
                    {formatINR(profile.salary)}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] font-medium text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="e.g. 850000"
                  value={profile.salary !== null ? profile.salary : ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : Number(e.target.value);
                    updateProfile({ salary: val });
                  }}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#047857] focus:bg-[#FFFFFF] transition-colors finovate-mono tabular-nums shadow-inner"
                  min="0"
                  step="10000"
                />
              </div>
              <p className="text-xs text-[#64748B]">
                Your net take-home annual pay after taxes and mandatory deductions.
              </p>
            </div>

            {/* 2. Credit Score Slider */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#334155]">
                  CIBIL / Experian Credit Score
                </label>
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-bold ${creditDetails.bg} ${creditDetails.color}`}
                >
                  {profile.creditScore !== null ? `${profile.creditScore} • ${creditDetails.label}` : "Select on slider"}
                </div>
              </div>

              <input
                type="range"
                min="300"
                max="900"
                step="5"
                value={profile.creditScore || 700}
                onChange={(e) => updateProfile({ creditScore: Number(e.target.value) })}
                className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#047857]"
              />

              <div className="flex justify-between text-[11px] text-[#94A3B8] font-medium finovate-mono">
                <span>300 (Poor)</span>
                <span>650 (Fair)</span>
                <span>750 (Good)</span>
                <span>900 (Excellent)</span>
              </div>
            </div>

            {/* 3. Debt & Outstanding Loans Toggle */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-semibold text-[#334155]">
                Active Loans or Ongoing EMIs?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateProfile({ hasLoan: false, loanAmount: 0 })}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    !profile.hasLoan
                      ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] shadow-sm"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  No Outstanding Loans
                </button>
                <button
                  type="button"
                  onClick={() => updateProfile({ hasLoan: true })}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    profile.hasLoan
                      ? "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] shadow-sm"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Yes, Active Loans / EMIs
                </button>
              </div>

              {profile.hasLoan && (
                <div className="pt-2 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Total Outstanding Principal Balance:</span>
                    {profile.loanAmount > 0 && (
                      <span className="text-[#B45309] font-bold finovate-mono tabular-nums">
                        {formatINR(profile.loanAmount)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] font-medium text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 350000"
                      value={profile.loanAmount || ""}
                      onChange={(e) => updateProfile({ loanAmount: Number(e.target.value) || 0 })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#B45309] focus:bg-[#FFFFFF] finovate-mono tabular-nums transition-colors shadow-inner"
                      min="0"
                      step="10000"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Emergency Fund Toggle */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-semibold text-[#334155]">
                Liquid Emergency Reserve (≥ 3 Months of Expenses)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateProfile({ emergencyFund: true })}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    profile.emergencyFund === true
                      ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] shadow-sm"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Yes, Fully Secured
                </button>
                <button
                  type="button"
                  onClick={() => updateProfile({ emergencyFund: false })}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    profile.emergencyFund === false
                      ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  No / Less than 3 Months
                </button>
              </div>
              <p className="text-xs text-[#64748B]">
                A liquid cushion ensures you never have to liquidate equity holdings during sudden life emergencies.
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <button
                type="submit"
                disabled={loading}
                className="finovate-btn-primary w-full py-3.5 text-sm disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Evaluating Financial Health...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Evaluate Solvency & Health</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results & 5-Axis Radar Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {health ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Overall Score Card */}
              <div className="finovate-card p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Solvency Health Index
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      health.health_tier === "Good"
                        ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                        : health.health_tier === "Fair"
                        ? "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    Tier: {health.health_tier}
                  </span>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold finovate-mono text-[#0F172A] tabular-nums">
                    {Math.round((health.health_score / 7) * 100)}
                  </span>
                  <span className="text-xs text-[#64748B] font-medium">
                    / 100 Financial Index ({health.health_score} / 7 pts)
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      health.health_tier === "Good"
                        ? "bg-[#047857]"
                        : health.health_tier === "Fair"
                        ? "bg-[#B45309]"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, (health.health_score / 7) * 100))}%` }}
                  />
                </div>

                {/* 5-Axis Radar Chart */}
                <div className="pt-1">
                  <FinancialHealthRadar metrics={health.radar_metrics} healthTier={health.health_tier} />
                </div>

                {/* Recommendation Summary */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed">
                  <span className="text-[#0F172A] font-bold block mb-1">Financial Analysis:</span>
                  {health.recommendation_summary}
                </div>
              </div>

              {/* Safety Lock Gate or Progression CTA */}
              {isLocked ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-3.5 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <ShieldAlert size={20} className="text-rose-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-rose-800">
                        Financial Safety Precaution
                      </h3>
                      <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                        Your balance sheet shows high debt exposure or an absence of emergency cash reserves.
                        Investing in equities without a safety buffer creates significant liquidation risk during market pullbacks.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200 flex flex-col gap-2">
                    <button
                      onClick={unlockHackerOverride}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm"
                    >
                      <Unlock size={14} />
                      <span>Explore Simulation Mode Anyway</span>
                    </button>
                    <span className="text-[11px] text-[#64748B] text-center">
                      Allows test-driving portfolio recommendations for educational purposes.
                    </span>
                  </div>
                </div>
              ) : canContinue ? (
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-6 space-y-3.5 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck size={22} className="text-[#047857] flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">Foundation Validated</h3>
                      <p className="text-xs text-[#047857]">
                        Your solvency profile satisfies algorithmic risk thresholds.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/guided-steps/recommendations"
                    className="finovate-btn-primary w-full py-3.5 text-sm"
                  >
                    <span>Proceed to Step 2: Recommendations</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            /* Unaudited State */
            <div className="finovate-card p-8 text-center flex flex-col items-center justify-center min-h-[380px] space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Awaiting Financial Parameters</h3>
              <p className="text-xs text-[#64748B] max-w-xs leading-relaxed">
                Input your authentic annual income, credit score, and buffer details to generate your customized 5-axis financial health radar.
              </p>
              <div className="text-xs text-[#64748B] bg-[#F1F5F9] px-3 py-1.5 rounded-full border border-[#E2E8F0] flex items-center space-x-1.5 finovate-mono">
                <Lock size={12} />
                <span>Step 2 is locked until baseline health is validated</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
