"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import {
  RotateCcw,
  ShieldAlert,
  Wallet,
  CreditCard,
  Building2,
  Clock,
  Activity,
  Award,
} from "lucide-react";

export default function Sidebar() {
  const { profile, health, isLocked, resetAllData } = useApp();

  // Compute 0-100 index for radial score ring
  const healthPercent = health
    ? Math.min(100, Math.max(0, Math.round((health.health_score / 7) * 100)))
    : null;

  // SVG circular ring geometry
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = healthPercent !== null
    ? circumference - (healthPercent / 100) * circumference
    : circumference;

  // Normalization for progress bars
  const salaryBarPct = profile.salary !== null
    ? Math.min(100, Math.max(0, Math.round((profile.salary / 1500000) * 100)))
    : 0;

  const creditBarPct = profile.creditScore !== null
    ? Math.min(100, Math.max(0, Math.round(((profile.creditScore - 300) / 600) * 100)))
    : 0;

  return (
    <aside className="w-72 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 select-none z-30 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#E2E8F0]">
          <Link href="/infoway" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] shadow-sm group-hover:border-[#047857] transition-colors">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-[#0F172A] text-base tracking-tight">FinSight</span>
                <span className="text-[#047857] font-extrabold text-base">AI</span>
                <span className="finovate-badge-green text-[10px] py-0 px-1.5">
                  PRO
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium">Corporate Wealth HUD</p>
            </div>
          </Link>
        </div>

        {/* Financial Health Score Ring Panel */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
              <Activity size={13} className="text-[#047857]" />
              <span>Financial Health</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                health?.health_tier === "Good"
                  ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                  : health?.health_tier === "Fair"
                  ? "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
                  : health?.health_tier === "Poor"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
              }`}
            >
              {health?.health_tier || "NOT AUDITED"}
            </span>
          </div>

          <div className="flex items-center space-x-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-3.5 shadow-sm">
            {/* Circular Gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 68 68">
                <circle
                  cx="34"
                  cy="34"
                  r={radius}
                  stroke="#E2E8F0"
                  strokeWidth="4.5"
                  fill="none"
                />
                {healthPercent !== null && (
                  <circle
                    cx="34"
                    cy="34"
                    r={radius}
                    stroke={
                      health?.health_tier === "Good"
                        ? "#047857"
                        : health?.health_tier === "Fair"
                        ? "#B45309"
                        : "#E11D48"
                    }
                    strokeWidth="4.5"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-extrabold finovate-mono text-[#0F172A] leading-none">
                  {healthPercent !== null ? healthPercent : "--"}
                </span>
                <span className="text-[9px] text-[#64748B] font-semibold leading-tight">/100</span>
              </div>
            </div>

            {/* Assessment Label */}
            <div className="text-xs space-y-0.5">
              <span className="text-[11px] font-semibold text-[#0F172A] block">
                {health
                  ? isLocked
                    ? "Capital Protection"
                    : "Equity Qualified"
                  : "Awaiting Assessment"}
              </span>
              <p className="text-[11px] text-[#64748B] leading-snug">
                {health
                  ? `${health.health_score} / 7 Composite Score`
                  : "Complete Step 1 to generate score"}
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Metrics Matrix */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Financial Standing
            </span>
            <span className="text-[11px] text-[#94A3B8] font-medium">User Profile</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Income Card */}
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[#64748B] font-medium">
                  <Wallet size={13} className="text-[#047857]" />
                  <span>Annual In-Hand</span>
                </div>
                <span className="font-bold finovate-mono text-[#0F172A] tabular-nums">
                  {profile.salary !== null ? formatINR(profile.salary) : "--"}
                </span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#047857] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${salaryBarPct}%` }}
                />
              </div>
            </div>

            {/* Credit Score Card */}
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[#64748B] font-medium">
                  <CreditCard size={13} className="text-[#B45309]" />
                  <span>Credit Score</span>
                </div>
                <span className="font-bold finovate-mono text-[#0F172A] tabular-nums">
                  {profile.creditScore !== null ? profile.creditScore : "--"}
                </span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    profile.creditScore !== null && profile.creditScore >= 750
                      ? "bg-[#047857]"
                      : profile.creditScore !== null && profile.creditScore >= 650
                      ? "bg-[#B45309]"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${creditBarPct}%` }}
                />
              </div>
            </div>

            {/* Outstanding Debt Card */}
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[#64748B] font-medium">
                  <Building2 size={13} className="text-[#64748B]" />
                  <span>Active Liabilities</span>
                </div>
                <span
                  className={`font-semibold finovate-mono tabular-nums ${
                    profile.hasLoan ? "text-amber-600" : "text-[#047857]"
                  }`}
                >
                  {profile.hasLoan ? formatINR(profile.loanAmount) : "None (Debt-Free)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Active EMIs</span>
                <span>{profile.hasLoan ? "Yes" : "No"}</span>
              </div>
            </div>

            {/* Emergency Reserve Card */}
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[#64748B] font-medium">
                  <Clock size={13} className="text-[#047857]" />
                  <span>Emergency Fund</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    profile.emergencyFund === true
                      ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                      : profile.emergencyFund === false
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "text-[#94A3B8]"
                  }`}
                >
                  {profile.emergencyFund === true
                    ? "Secured (≥3M)"
                    : profile.emergencyFund === false
                    ? "Underfunded"
                    : "--"}
                </span>
              </div>
              <span className="text-[11px] text-[#94A3B8] block">3-6 Months Liquid Reserves</span>
            </div>
          </div>

          {/* Safety Advice Card if locked */}
          {isLocked && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-xs">
              <div className="flex items-center space-x-1.5 text-rose-700 font-bold">
                <ShieldAlert size={14} />
                <span>Financial Safety Alert</span>
              </div>
              <p className="text-[11px] text-rose-600 leading-snug">
                Establish an emergency cash buffer before allocating capital into equity markets.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Technical Indicators & Reset Action */}
      <div className="p-5 border-t border-[#E2E8F0] space-y-3 bg-[#FFFFFF]">
        <button
          onClick={resetAllData}
          className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
        >
          <RotateCcw size={13} />
          <span>Reset All Profile Data</span>
        </button>

        {/* Real-time system pulse */}
        <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5 text-[11px] text-[#64748B] font-medium">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
              <span>FastAPI Inference Core</span>
            </span>
            <span className="text-[#047857] font-semibold">Active</span>
          </div>

          <div className="flex items-center justify-between text-[#94A3B8]">
            <span>Market Feed</span>
            <span>NSE/BSE Live</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
