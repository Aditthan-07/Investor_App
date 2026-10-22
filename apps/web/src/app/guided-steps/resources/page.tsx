"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Compass,
} from "lucide-react";

interface ResourceItem {
  id: string;
  title: string;
  creator: string;
  role: string;
  category: "Beginner Guides" | "Fundamental Analysis" | "Investor Psychology";
  duration: string;
  description: string;
  url: string;
  badge: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: "rachana-basics",
    title: "Stock Market Basics for Beginners",
    creator: "CA Rachana Ranade",
    role: "Chartered Accountant & Financial Educator",
    category: "Beginner Guides",
    duration: "1h 45m Masterclass",
    description: "Detailed dissection of the Indian exchange architecture (NSE/BSE), primary vs secondary markets, order types, and clearing infrastructure.",
    url: "https://www.youtube.com/watch?v=3UF0ymVdYLA",
    badge: "Must Watch",
  },
  {
    id: "pranjal-investing",
    title: "Complete Stock Market Investing Course",
    creator: "Pranjal Kamra",
    role: "Finology Founder & Value Investor",
    category: "Beginner Guides",
    duration: "2h 15m Comprehensive",
    description: "Systematic analysis of capital formation, IPO mechanics, index fund strategies, and multi-asset compounding.",
    url: "https://www.youtube.com/watch?v=Xn7KWR9EOGQ",
    badge: "Top Rated",
  },
  {
    id: "zerodha-varsity-basics",
    title: "Zerodha Varsity: Introduction to Stock Markets",
    creator: "Zerodha Varsity",
    role: "India's Premier Financial Education Platform",
    category: "Beginner Guides",
    duration: "15 Structured Modules",
    description: "Deep dive into market regulators (SEBI), depository participants (CDSL/NSDL), trading vs demat accounts, and settlement cycles.",
    url: "https://zerodha.com/varsity/module/introduction-to-stock-markets/",
    badge: "Interactive",
  },
  {
    id: "rachana-balance-sheet",
    title: "How to Read an Annual Report & Balance Sheet",
    creator: "CA Rachana Ranade",
    role: "Chartered Accountant",
    category: "Fundamental Analysis",
    duration: "55m Masterclass",
    description: "Methodologies for auditing Profit & Loss statements, operating cash flows, debt covenants, and identifying accounting red flags.",
    url: "https://www.youtube.com/watch?v=P_VnO_d46xM",
    badge: "Financial Audit",
  },
  {
    id: "zerodha-fundamental",
    title: "Fundamental Analysis & Valuation Frameworks",
    creator: "Zerodha Varsity",
    role: "Zerodha Education Desk",
    category: "Fundamental Analysis",
    duration: "16 Chapters",
    description: "Quantitative analysis of ROE, ROCE, P/E multiples, EV/EBITDA, and discounted cash flow valuation for Indian listed equities.",
    url: "https://zerodha.com/varsity/module/fundamental-analysis/",
    badge: "Deep Dive",
  },
  {
    id: "parag-parikh",
    title: "Stocks to Riches: Insights on Investor Psychology",
    creator: "Parag Parikh",
    role: "Late Founder, PPFAS Mutual Fund",
    category: "Investor Psychology",
    duration: "Classic Book & Series",
    description: "Foundational lessons on behavioral finance, cognitive biases, avoiding speculative market bubbles, and long-term discipline.",
    url: "https://amzn.in/d/stockstoriches",
    badge: "Classic",
  },
];

const GOLDEN_RULES = [
  {
    title: "1. Maintain Cash Reserves Before Equity Exposure",
    desc: "Always maintain 3 to 6 months of living expenses in liquid debt funds or fixed deposits before deploying capital into volatile equity markets.",
  },
  {
    title: "2. Avoid High-Leverage F&O Speculation",
    desc: "SEBI studies consistently demonstrate that over 90% of retail derivatives (F&O) participants suffer net capital losses. Wealth creation is driven by long-term compounding.",
  },
  {
    title: "3. Diversify Across Uncorrelated Assets",
    desc: "Combining Indian blue-chip equities with Sovereign Gold Bonds (SGB) and corporate debt drastically dampens drawdowns during severe macroeconomic crises.",
  },
  {
    title: "4. Systematic Rupee-Cost Averaging",
    desc: "Disciplined capital deployment over regular intervals eliminates the psychological pitfall of attempting to time market peaks and troughs.",
  },
];

export default function InvestmentResourcesStep() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Beginner Guides", "Fundamental Analysis", "Investor Psychology"];

  const filteredResources = selectedCategory === "All"
    ? RESOURCES
    : RESOURCES.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="finovate-badge-green mb-2">
          <span>Step 04 of 04</span>
          <span>•</span>
          <span>Knowledge Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Financial Education & Learning Center
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Build a solid foundation with masterclasses and research guides from India’s leading financial educators.
          Learn fundamental analysis, balance sheet auditing, and portfolio risk management.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-[#047857] text-[#FFFFFF] font-bold shadow-md shadow-[#047857]/20"
                : "bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] shadow-sm"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((item) => (
          <div
            key={item.id}
            className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#047857]/50 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-lg group shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] finovate-mono">
                  {item.badge}
                </span>
                <span className="text-xs text-[#64748B] flex items-center space-x-1 font-medium">
                  <Clock size={12} />
                  <span>{item.duration}</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#047857] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-[#334155] mt-1">{item.creator}</p>
                <span className="text-[11px] text-[#64748B] block">{item.role}</span>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#ECFDF5] border border-[#E2E8F0] hover:border-[#A7F3D0] text-[#334155] hover:text-[#047857] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <span>Access Masterclass</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Golden Rules Section */}
      <div className="finovate-card p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 pb-4 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">4 Golden Principles for Retail Investors</h3>
            <p className="text-xs text-[#64748B]">Essential investment canons for long-term compounding and risk management.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GOLDEN_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
            >
              <h4 className="text-xs font-bold text-[#047857]">{rule.title}</h4>
              <p className="text-xs text-[#334155] leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-6 finovate-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Continue Your Investment Journey</h4>
          <p className="text-xs text-[#64748B] mt-0.5">
            Return to Market Intelligence or recalculate your financial baseline in Step 1.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/guided-steps/health"
            className="py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold transition-all shadow-sm"
          >
            Re-audit Step 1
          </Link>
          <Link
            href="/infoway"
            className="finovate-btn-primary py-2.5 px-5 text-xs font-bold"
          >
            <span>Market Intelligence</span>
            <Compass size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
