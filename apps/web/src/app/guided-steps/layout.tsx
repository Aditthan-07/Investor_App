import React from "react";
import GuidedStepsNav from "@/components/GuidedStepsNav";

export const metadata = {
  title: "Quant Pipeline – FinSight Pro",
  description: "Sequential solvency audit, ML risk calibration, multi-asset allocation, and institutional research.",
};

export default function GuidedStepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full space-y-6">
      {/* 4-Step Minimalist Horizontal Pipeline */}
      <GuidedStepsNav />

      {/* Step Content Container */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
