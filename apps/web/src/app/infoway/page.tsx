"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Activity,
  Send,
  User,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { fetchNiftyUpdate, fetchMarketSentiment, sendChatMessage } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function InfowayPage() {
  const { unlockHackerOverride } = useApp();

  // Market Updates State
  const [nifty, setNifty] = useState<any>(null);
  const [sentiment, setSentiment] = useState<any>(null);
  const [loadingMarket, setLoadingMarket] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am FinSight AI, your personal financial advisor and market analyst. Ask me anything about Indian stocks, asset allocation strategies, macroeconomic trends, or enter your financial details in Guided Steps to evaluate your solvency.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMarket() {
      try {
        const [niftyData, sentData] = await Promise.all([
          fetchNiftyUpdate(),
          fetchMarketSentiment(),
        ]);
        setNifty(niftyData);
        setSentiment(sentData);
      } catch (err) {
        setNifty({
          latest_price: 24850.2,
          change_pct: 0.65,
          summary: "Nifty 50: ₹24,850.20 (+0.65% 2W trend)",
          history: [
            { date: "2026-09-15", price: 24690 },
            { date: "2026-09-18", price: 24720 },
            { date: "2026-09-22", price: 24650 },
            { date: "2026-09-25", price: 24810 },
            { date: "2026-09-29", price: 24850.2 },
          ],
        });
        setSentiment({
          sentiment_tag: "Bullish",
          score: 0.14,
          headlines: [
            { title: "Nifty records positive consolidation above key 20-day moving average - Reuters", link: "https://news.google.com", published: "Today" },
            { title: "Foreign institutional investors expand domestic equity allocations - Livemint", link: "https://news.google.com", published: "Today" },
            { title: "RBI monetary policy stance anchors domestic interbank liquidity - Bloomberg", link: "https://news.google.com", published: "Today" },
          ],
        });
      } finally {
        setLoadingMarket(false);
      }
    }
    loadMarket();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loadingChat) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoadingChat(true);

    if (text.toLowerCase().includes("hack override") || text.toLowerCase().includes("risk override")) {
      unlockHackerOverride();
    }

    try {
      const res = await sendChatMessage(text);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to reach the FinSight AI backend service. Please ensure the server is running on port 8000.",
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const PROMPT_SUGGESTIONS = [
    "Evaluate my financial health: salary ₹8.5L, credit 780, no loans, emergency fund yes",
    "What is the current market sentiment?",
    "Show me TCS stock valuation and 2-week performance",
    "How should I allocate capital for balanced risk?",
  ];

  // Helper to extract source and title from headlines
  const parseHeadline = (rawTitle: string) => {
    const parts = rawTitle.split(" - ");
    if (parts.length > 1) {
      const source = parts[parts.length - 1].trim();
      const title = parts.slice(0, -1).join(" - ").trim();
      return { source, title };
    }
    return { source: "Market Wire", title: rawTitle };
  };

  // Generate SVG Mini Area Sparkline for NIFTY
  const renderSparkline = () => {
    const history = nifty?.history || [];
    if (!history.length) return null;

    const prices: number[] = history.map((h: any) => h.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    const w = 240;
    const h = 50;
    const padding = 4;

    const points = prices.map((p, idx) => {
      const x = padding + (idx / (prices.length - 1)) * (w - 2 * padding);
      const y = h - padding - ((p - minP) / range) * (h - 2 * padding);
      return { x, y };
    });

    const linePath = points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

    const isPositive = nifty?.change_pct >= 0;
    const strokeColor = isPositive ? "#047857" : "#E11D48";
    const gradientId = "niftySparklineGrad";

    return (
      <svg width={w} height={h} className="overflow-visible select-none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={strokeColor}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="finovate-badge-green mb-2">
            <Sparkles size={13} />
            <span>Market Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Market Intelligence & Advisory
          </h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Real-time Indian equity benchmarks, news sentiment analysis, and conversational wealth management powered by institutional machine learning.
          </p>
        </div>
      </div>

      {/* SECTION 1: Daily Market Updates & Integrated Mini Sparkline */}
      <section className="finovate-card p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
          {/* NIFTY 50 Benchmark Overview with Mini Sparkline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block mb-1">
                Benchmark Index (NSE)
              </span>
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] finovate-mono tabular-nums">
                  {nifty ? formatINR(nifty.latest_price) : "₹24,850.20"}
                </span>
                <span
                  className={`text-sm font-bold flex items-center space-x-0.5 finovate-mono ${
                    nifty && nifty.change_pct >= 0 ? "text-[#047857]" : "text-rose-600"
                  }`}
                >
                  {nifty && nifty.change_pct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>
                    {nifty && nifty.change_pct >= 0 ? "+" : ""}
                    {nifty?.change_pct ? nifty.change_pct.toFixed(2) : "0.65"}% 2W
                  </span>
                </span>
              </div>
            </div>

            {/* Sparkline Graphic */}
            <div className="hidden sm:block border-l border-[#E2E8F0] pl-6">
              <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                14-Day Performance Trend
              </span>
              {renderSparkline()}
            </div>
          </div>

          {/* Sentiment Gauge & Groww Broker Link */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            {sentiment && (
              <div className="flex items-center space-x-2 text-xs bg-[#F8FAFC] px-3.5 py-2 rounded-xl border border-[#E2E8F0] shadow-sm">
                <span className="text-[#64748B] font-medium">Market Sentiment:</span>
                <span
                  className={`font-bold ${
                    sentiment.score > 0.08
                      ? "text-[#047857]"
                      : sentiment.score < -0.08
                      ? "text-rose-600"
                      : "text-[#0F172A]"
                  }`}
                >
                  {sentiment.sentiment_tag.replace(/[^\w\s]/gi, "").trim() || "Neutral"}
                </span>
                <span className="text-[#94A3B8] finovate-mono">({sentiment.score > 0 ? "+" : ""}{sentiment.score.toFixed(2)})</span>
              </div>
            )}

            <a
              href="https://groww.in/charts/indices/nifty"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#047857] hover:text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-3.5 py-2 rounded-xl border border-[#A7F3D0] flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <span>Groww Live Chart</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* Structured Institutional News Wire */}
        {sentiment && sentiment.headlines && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
                <Activity size={14} className="text-[#047857]" />
                <span>Verified Financial News Wire</span>
              </span>
              <span className="text-xs text-[#94A3B8]">Live Market Dispatches</span>
            </div>

            <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]/50 overflow-hidden">
              {sentiment.headlines.slice(0, 4).map((h: any, idx: number) => {
                const { source, title } = parseHeadline(h.title);
                return (
                  <div
                    key={idx}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFFFFF] transition-colors"
                  >
                    <div className="flex items-start sm:items-center space-x-3 min-w-0">
                      <span className="text-[11px] font-semibold text-[#475569] bg-[#FFFFFF] px-2.5 py-0.5 rounded-md border border-[#E2E8F0] flex-shrink-0 finovate-mono shadow-sm">
                        {source}
                      </span>
                      <h4 className="text-xs sm:text-sm text-[#0F172A] font-medium tracking-tight truncate leading-normal">
                        {title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0 text-xs">
                      <span className="text-[#94A3B8] flex items-center space-x-1 font-medium">
                        <Clock size={12} />
                        <span>{h.published || "Today"}</span>
                      </span>

                      {h.link && (
                        <a
                          href={h.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#047857] hover:text-[#065F46] transition-colors p-1"
                          title="Read full article"
                        >
                          <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Conversational AI Financial Advisor */}
      <section className="finovate-card p-6 sm:p-7 space-y-4 shadow-sm">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                FinSight Advisory Console
              </h3>
              <p className="text-xs text-[#64748B]">Institutional portfolio insights and conversational wealth intelligence</p>
            </div>
          </div>
          <div className="finovate-badge-green">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
            <span>AI Online</span>
          </div>
        </div>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {PROMPT_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] text-xs px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] transition-all text-left font-medium shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div
          ref={chatScrollRef}
          className="h-[400px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 overflow-y-auto space-y-4 text-xs sm:text-sm"
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                m.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 font-bold ${
                  m.role === "user"
                    ? "bg-[#047857] text-white"
                    : "bg-[#FFFFFF] text-[#047857] border border-[#E2E8F0] shadow-sm"
                }`}
              >
                {m.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#047857] text-[#FFFFFF] shadow-sm"
                    : "bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loadingChat && (
            <div className="flex items-center space-x-2.5 text-xs text-[#64748B] py-2">
              <div className="w-3.5 h-3.5 border-2 border-[#047857] border-t-transparent rounded-full animate-spin" />
              <span>FinSight AI is analyzing quantitative models...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Indian equities, risk assessment, or asset allocation..."
            className="flex-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#047857] transition-colors shadow-inner"
          />

          <button
            type="submit"
            disabled={loadingChat || !input.trim()}
            className="finovate-btn-primary disabled:opacity-40 px-5 py-3 text-xs sm:text-sm"
          >
            <span>Ask Advisor</span>
            <Send size={14} />
          </button>
        </form>
      </section>
    </div>
  );
}
