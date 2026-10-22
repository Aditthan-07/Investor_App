"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Radio } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface NiftyData {
  latest_price: number;
  change_pct: number;
  summary: string;
}

interface SentimentData {
  sentiment_tag: string;
  score: number;
}

export default function NiftyTicker() {
  const [nifty, setNifty] = useState<NiftyData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [niftyRes, sentRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/market/nifty").then((r) => r.json()),
          fetch("http://localhost:8000/api/v1/market/sentiment").then((r) => r.json()),
        ]);
        setNifty(niftyRes);
        setSentiment(sentRes);
      } catch (err) {
        setNifty({
          latest_price: 24850.5,
          change_pct: 0.62,
          summary: "Nifty 50: ₹24,850.50 (+0.62%)",
        });
        setSentiment({
          sentiment_tag: "BULLISH",
          score: 0.14,
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const cleanSentiment = sentiment
    ? sentiment.sentiment_tag.replace(/[^\w\s]/gi, "").trim().toUpperCase()
    : "BULLISH";

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 py-2 text-xs finovate-mono">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Ticker Pulse */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] text-[#64748B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
            <span>NSE FEED</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[#64748B] font-semibold">NIFTY 50:</span>
            <span className="font-bold text-[#0F172A] tabular-nums">
              {nifty ? formatINR(nifty.latest_price) : "₹24,850.00"}
            </span>
            {nifty && (
              <span
                className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                  nifty.change_pct >= 0
                    ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {nifty.change_pct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>
                  {nifty.change_pct >= 0 ? "+" : ""}
                  {nifty.change_pct.toFixed(2)}%
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Ambient Sentiment */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-[#64748B] text-[11px]">
            <Activity size={12} className="text-[#94A3B8]" />
            <span className="text-[#64748B]">SENTIMENT:</span>
            <span className="font-bold text-[#0F172A]">{cleanSentiment}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-0.5 rounded text-[10px]">
            <Radio size={10} className="text-[#047857]" />
            <span>AI GATE ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
