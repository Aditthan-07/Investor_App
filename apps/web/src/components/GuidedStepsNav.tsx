"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Check, Lock } from "lucide-react";

const STEPS = [
  { id: "health", num: "01", label: "Financial Health", path: "/guided-steps/health" },
  { id: "recommendations", num: "02", label: "AI Recommendations", path: "/guided-steps/recommendations" },
  { id: "analysis", num: "03", label: "Portfolio Dynamics", path: "/guided-steps/analysis" },
  { id: "resources", num: "04", label: "Learning Center", path: "/guided-steps/resources" },
];

export default function GuidedStepsNav() {
  const pathname = usePathname();
  const { health, recommendation, canContinue } = useApp();

  const isStepComplete = (id: string) => {
    if (id === "health") return health !== null && canContinue;
    if (id === "recommendations") return recommendation !== null;
    if (id === "analysis") return recommendation !== null;
    return false;
  };

  const isStepAccessible = (id: string) => {
    if (id === "health" || id === "resources") return true;
    if (id === "recommendations") return canContinue;
    if (id === "analysis") return canContinue && recommendation !== null;
    return false;
  };

  return (
    <nav className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 sm:p-5 mb-8 shadow-sm">
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, idx) => {
          const isActive = pathname.startsWith(step.path);
          const completed = isStepComplete(step.id);
          const accessible = isStepAccessible(step.id);
          const isLast = idx === STEPS.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <Link
                href={accessible ? step.path : "#"}
                className={`flex items-center space-x-3 group relative z-10 transition-all ${
                  accessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                {/* Numbered Pill / Checkmark */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center finovate-mono text-xs font-bold transition-all shadow-sm ${
                    completed
                      ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                      : isActive
                      ? "bg-[#047857] text-[#FFFFFF] font-extrabold shadow-sm"
                      : accessible
                      ? "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] group-hover:bg-[#F1F5F9] group-hover:text-[#0F172A]"
                      : "bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]"
                  }`}
                >
                  {completed ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : !accessible ? (
                    <Lock size={12} />
                  ) : (
                    step.num
                  )}
                </div>

                {/* Step Label */}
                <div className="hidden sm:block">
                  <span
                    className={`text-xs font-semibold tracking-tight transition-colors ${
                      isActive
                        ? "text-[#047857] font-bold"
                        : completed
                        ? "text-[#0F172A] font-semibold"
                        : accessible
                        ? "text-[#64748B] group-hover:text-[#0F172A]"
                        : "text-[#94A3B8]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </Link>

              {/* Connecting Pipeline Line */}
              {!isLast && (
                <div className="flex-1 mx-3 sm:mx-4 h-[2px] bg-[#E2E8F0] relative overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      completed ? "bg-[#047857] w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
