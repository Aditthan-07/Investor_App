"use client";

import React, { useState } from "react";
import { TrendingUp, Layers } from "lucide-react";

interface NormalizedData {
  dates: string[];
  series: Record<string, number[]>;
}

interface ChartProps {
  data: NormalizedData | null;
  loading?: boolean;
}

const PALETTE = ["#047857", "#B45309", "#2563EB", "#7C3AED", "#0D9488", "#DC2626"];

export default function RelativeMomentumChart({ data, loading = false }: ChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hiddenTickers, setHiddenTickers] = useState<Set<string>>(new Set());

  if (loading || !data || !data.dates.length || !Object.keys(data.series).length) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 text-center shadow-sm">
        <Layers className="text-[#94A3B8] mb-2" size={28} />
        <span className="text-sm font-semibold text-[#0F172A]">Relative Stock Momentum</span>
        <span className="text-xs text-[#64748B] mt-1 max-w-sm">
          Select or search stocks to calculate and compare their performance trajectories from a common Day 0 baseline (0.0%).
        </span>
      </div>
    );
  }

  const { dates, series } = data;
  const tickers = Object.keys(series).filter((t) => !hiddenTickers.has(t));

  let minPct = -2.0;
  let maxPct = 2.0;

  tickers.forEach((t) => {
    const vals = series[t] || [];
    vals.forEach((v) => {
      if (v < minPct) minPct = v;
      if (v > maxPct) maxPct = v;
    });
  });

  minPct = Math.floor(minPct - 0.5);
  maxPct = Math.ceil(maxPct + 0.5);
  const range = maxPct - minPct || 1;

  const width = 640;
  const height = 250;
  const padding = { top: 25, right: 30, bottom: 30, left: 45 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (dates.length <= 1) return padding.left;
    return padding.left + (index / (dates.length - 1)) * chartW;
  };

  const getY = (pct: number) => {
    return padding.top + chartH - ((pct - minPct) / range) * chartH;
  };

  const toggleTicker = (t: string) => {
    setHiddenTickers((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-[#047857]" />
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Relative Momentum Comparison (Day 0 Normalized Baseline)
            </h3>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Normalized to 0.0% to evaluate genuine percentage return alpha independent of share price differences.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(series).map((t, idx) => {
            const isHidden = hiddenTickers.has(t);
            const color = PALETTE[idx % PALETTE.length];
            return (
              <button
                key={t}
                onClick={() => toggleTicker(t)}
                className={`text-xs font-semibold px-3 py-1 rounded-md border transition-all flex items-center space-x-1.5 ${
                  isHidden
                    ? "bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] opacity-60"
                    : "bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] hover:border-[#047857]/50 shadow-sm"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isHidden ? "#94A3B8" : color }} />
                <span>{t.replace(".NS", "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart with Crosshair and Hover */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal Grid lines */}
          {[-10, -5, 0, 5, 10].map((level) => {
            if (level < minPct || level > maxPct) return null;
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={level === 0 ? "rgba(4, 120, 87, 0.45)" : "#E2E8F0"}
                  strokeWidth={level === 0 ? "1.2" : "0.75"}
                  strokeDasharray={level === 0 ? undefined : "3 3"}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-[#64748B] tabular-nums"
                >
                  {level > 0 ? `+${level}%` : `${level}%`}
                </text>
              </g>
            );
          })}

          {/* Series Polylines */}
          {tickers.map((t, idx) => {
            const vals = series[t] || [];
            if (!vals.length) return null;
            const color = PALETTE[idx % PALETTE.length];

            const points = vals
              .map((val, i) => `${getX(i)},${getY(val)}`)
              .join(" ");

            return (
              <g key={t}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {hoverIndex !== null && vals[hoverIndex] !== undefined && (
                  <circle
                    cx={getX(hoverIndex)}
                    cy={getY(vals[hoverIndex])}
                    r="4"
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}

          {/* Crosshair Line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={height - padding.bottom}
              stroke="rgba(4, 120, 87, 0.4)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Interactive Mouse Hit Rectangles */}
          {dates.map((d, i) => {
            const x = getX(i);
            const prevX = i > 0 ? getX(i - 1) : padding.left;
            const nextX = i < dates.length - 1 ? getX(i + 1) : width - padding.right;
            const w = (nextX - prevX) / 2;

            return (
              <rect
                key={d}
                x={x - w / 2}
                y={padding.top}
                width={w}
                height={chartH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* X Axis Dates */}
          {dates.map((d, i) => {
            if (i % Math.ceil(dates.length / 5) !== 0 && i !== dates.length - 1) return null;
            return (
              <text
                key={d}
                x={getX(i)}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] font-mono fill-[#64748B]"
              >
                {d.slice(5)}
              </text>
            );
          })}
        </svg>

        {/* Hover Crosshair Tooltip */}
        {hoverIndex !== null && dates[hoverIndex] && (
          <div className="absolute top-3 right-3 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg p-3 shadow-xl text-xs pointer-events-none space-y-1.5">
            <div className="text-[11px] text-[#64748B] font-semibold border-b border-[#E2E8F0] pb-1">
              Date: {dates[hoverIndex]} (Day {hoverIndex})
            </div>
            <div className="space-y-1">
              {tickers.map((t, idx) => {
                const val = series[t]?.[hoverIndex] ?? 0;
                const color = PALETTE[idx % PALETTE.length];
                return (
                  <div key={t} className="flex items-center justify-between space-x-4 text-xs">
                    <span className="flex items-center space-x-1.5 text-[#334155] font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span>{t.replace(".NS", "")}</span>
                    </span>
                    <span
                      className={`font-bold finovate-mono tabular-nums ${
                        val >= 0 ? "text-[#047857]" : "text-rose-600"
                      }`}
                    >
                      {val >= 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
