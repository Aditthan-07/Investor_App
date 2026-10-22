"use client";

import React from "react";

export interface RadarMetricItem {
  subject: string;
  score: number;
}

interface RadarProps {
  metrics: RadarMetricItem[];
  healthTier?: string;
}

export default function FinancialHealthRadar({ metrics, healthTier = "Uninitialized" }: RadarProps) {
  const size = 320;
  const center = size / 2;
  const radius = 100;
  const totalAxes = 5;

  // Default axes if uninitialized
  const displayMetrics = metrics.length === 5 ? metrics : [
    { subject: "Solvency", score: 0 },
    { subject: "Liquidity", score: 0 },
    { subject: "Debt Safety", score: 0 },
    { subject: "Credit Buffer", score: 0 },
    { subject: "Horizon", score: 0 },
  ];

  // Calculate coordinates for any score (0-100) at axis index
  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (Math.max(5, Math.min(100, score)) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Label coordinates (positioned slightly outside the max radius)
  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = radius + 26;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Concentric polygon background grids (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const polygonPoints = displayMetrics
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.score);
      return `${x},${y}`;
    })
    .join(" ");

  const hasData = displayMetrics.some((m) => m.score > 0);

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl relative overflow-hidden w-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 pb-3 border-b border-[#E2E8F0]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          5-Axis Financial Dimensions
        </span>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            healthTier === "Good"
              ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
              : healthTier === "Fair"
              ? "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
              : healthTier === "Poor"
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
          }`}
        >
          {healthTier}
        </span>
      </div>

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background Concentric Grid Rings */}
          {gridLevels.map((lvl, lvlIdx) => {
            const pts = Array.from({ length: totalAxes })
              .map((_, i) => {
                const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                const r = radius * lvl;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              })
              .join(" ");
            return (
              <polygon
                key={lvlIdx}
                points={pts}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth={lvlIdx === 3 ? "1.2" : "0.75"}
                strokeDasharray={lvlIdx < 3 ? "3 3" : undefined}
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {Array.from({ length: totalAxes }).map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Dynamic User Data Polygon */}
          {hasData && (
            <g className="transition-all duration-700 ease-out">
              <polygon
                points={polygonPoints}
                fill="rgba(4, 120, 87, 0.15)"
                stroke="#047857"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_2px_8px_rgba(4,120,87,0.15)]"
              />
              {/* Vertex Nodes */}
              {displayMetrics.map((m, i) => {
                const { x, y } = getCoordinates(i, m.score);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#047857"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}

          {/* Metric Axis Labels */}
          {displayMetrics.map((m, i) => {
            const { x, y } = getLabelCoordinates(i);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-semibold fill-[#475569] select-none"
              >
                {m.subject} {hasData && `(${Math.round(m.score)})`}
              </text>
            );
          })}
        </svg>

        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-[#64748B] bg-[#F8FAFC] px-3.5 py-1.5 rounded-full border border-[#E2E8F0] shadow-sm">
              Enter financial parameters to plot radar
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
