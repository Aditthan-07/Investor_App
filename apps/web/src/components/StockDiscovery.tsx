"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Check, X, Layers } from "lucide-react";
import { searchStocks, fetchStockQuote } from "@/lib/api";
import { formatINR } from "@/lib/utils";

interface StockDiscoveryProps {
  selectedTickers: string[];
  onToggleTicker: (ticker: string) => void;
}

export default function StockDiscovery({ selectedTickers, onToggleTicker }: StockDiscoveryProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ ticker: string; company_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [quoteCache, setQuoteCache] = useState<Record<string, { price: number; change: number }>>({});

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchStocks(query);
        setResults(res);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Load quotes for selected tickers
  useEffect(() => {
    selectedTickers.forEach(async (ticker) => {
      if (!quoteCache[ticker]) {
        try {
          const q = await fetchStockQuote(ticker);
          setQuoteCache((prev) => ({
            ...prev,
            [ticker]: { price: q.current_price, change: q.two_week_change_pct },
          }));
        } catch (e) {}
      }
    });
  }, [selectedTickers]);

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Layers size={16} className="text-[#047857]" />
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Stock Discovery & Watchlist Tracker
            </h3>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Search any Indian listed equity on NSE to add to your momentum comparison workspace.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#64748B] bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#E2E8F0] finovate-mono">
          {selectedTickers.length} Active in Comparison
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company name or ticker (e.g. Reliance, TCS, HDFC Bank, Infosys)..."
          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#047857] focus:bg-[#FFFFFF] transition-colors shadow-inner"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#047857] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl shadow-xl max-h-60 overflow-y-auto z-30 divide-y divide-[#E2E8F0]">
            {results.map((item) => {
              const isSelected = selectedTickers.includes(item.ticker);
              return (
                <div
                  key={item.ticker}
                  onClick={() => onToggleTicker(item.ticker)}
                  className="p-3.5 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs finovate-mono font-bold text-[#0F172A] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                      {item.ticker.replace(".NS", "")}
                    </span>
                    <span className="text-xs text-[#64748B] font-medium truncate max-w-xs">
                      {item.company_name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                        : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]"
                    }`}
                  >
                    {isSelected ? <Check size={13} /> : <Plus size={13} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Active Watchlist Pills */}
      {selectedTickers.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedTickers.map((ticker) => {
            const quote = quoteCache[ticker];
            const isPos = quote && quote.change >= 0;
            return (
              <div
                key={ticker}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 flex items-center space-x-2 text-xs shadow-sm"
              >
                <span className="font-bold text-[#0F172A] finovate-mono">{ticker.replace(".NS", "")}</span>
                {quote && (
                  <span className="text-xs finovate-mono text-[#64748B] font-medium">
                    {formatINR(quote.price)}
                  </span>
                )}
                {quote && (
                  <span
                    className={`text-xs font-semibold finovate-mono flex items-center ${
                      isPos ? "text-[#047857]" : "text-rose-600"
                    }`}
                  >
                    {isPos ? "+" : ""}
                    {quote.change.toFixed(1)}%
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onToggleTicker(ticker)}
                  className="text-[#94A3B8] hover:text-rose-600 transition-colors ml-1"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
