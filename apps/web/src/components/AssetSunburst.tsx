"use client";

import React, { useState } from "react";
import { PieChart } from "lucide-react";

interface SunburstProps {
  allocations: Record<string, number> | null;
  strategyTier?: string;
  confidence?: number;
}

const ASSET_COLORS: Record<string, string> = {
  "Large Cap Equities": "#047857",
  "Large & Mid Cap Equities": "#10B981",
  "High Growth Equities": "#0F766E",
  "Thematic & Mid-Caps": "#B45309",
  "Government Bonds & Debt": "#D97706",
  "Corporate Debt & Fixed Income": "#92400E",
  "Sovereign Gold / Commodities": "#CA8A04",
  "Sovereign Gold / Hedge": "#CA8A04",
  "Liquid Emergency Buffer": "#64748B",
  "Liquid Cash Buffer": "#64748B",
};

export default function AssetSunburst({ allocations, strategyTier = "Balanced", confidence = 0.85 }: SunburstProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  if (!allocations || !Object.keys(allocations).length) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 text-center shadow-sm">
        <PieChart className="text-[#94A3B8] mb-2" size={28} />
        <span className="text-sm font-semibold text-[#0F172A]">Target Asset Allocation</span>
        <span className="text-xs text-[#64748B] mt-1 max-w-xs">
          Generate an AI recommendation in Step 2 to compute your personalized multi-asset allocation.
        </span>
      </div>
    );
  }

  const size = 270;
  const center = size / 2;
  const innerR = 68;
  const outerR = 108;

  const entries = Object.entries(allocations);
  const total = entries.reduce((acc, [, val]) => acc + val, 0) || 100;

  let currentAngle = -Math.PI / 2;
  const slices = entries.map(([name, val]) => {
    const sliceAngle = (val / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = center + outerR * Math.cos(startAngle);
    const y1 = center + outerR * Math.sin(startAngle);
    const x2 = center + outerR * Math.cos(endAngle);
    const y2 = center + outerR * Math.sin(endAngle);

    const x3 = center + innerR * Math.cos(endAngle);
    const y3 = center + innerR * Math.sin(endAngle);
    const x4 = center + innerR * Math.cos(startAngle);
    const y4 = center + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `
      M ${x1} ${y1}
      A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      name,
      val,
      pathData,
      color: ASSET_COLORS[name] || "#64748B",
    };
  });

  const activeSlice = hoveredSlice
    ? entries.find(([k]) => k === hoveredSlice)
    : null;

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl relative w-full shadow-sm">
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible select-none">
          {slices.map((slice) => {
            const isHovered = hoveredSlice === slice.name;
            return (
              <path
                key={slice.name}
                d={slice.pathData}
                fill={slice.color}
                fillOpacity={hoveredSlice ? (isHovered ? 1.0 : 0.4) : 0.88}
                stroke="#FFFFFF"
                strokeWidth={2}
                onMouseEnter={() => setHoveredSlice(slice.name)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="transition-all duration-200 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {activeSlice ? (
            <div className="space-y-0.5 animate-fadeIn">
              <span className="text-2xl font-extrabold finovate-mono text-[#0F172A] tabular-nums">
                {activeSlice[1]}%
              </span>
              <span className="text-xs font-semibold text-[#047857] block max-w-[110px] truncate leading-tight">
                {activeSlice[0]}
              </span>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-[#0F172A] block">
                {strategyTier}
              </span>
              <span className="text-xs text-[#047857] font-semibold block">
                {(confidence * 100).toFixed(0)}% Confidence
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-[#64748B] font-medium mt-3 text-center">
        Hover over any segment to inspect asset weighting
      </div>
    </div>
  );
}
