"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { sendChatMessage } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function InfowayChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am FinSight Infoway, your intelligent co-pilot. Ask me to analyze your finances, check live stock rates, or get today's market sentiment."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userText);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection to FastAPI assistant backend interrupted. Please verify backend status." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#047857] hover:bg-[#065F46] text-white font-bold px-4 py-3 rounded-full flex items-center space-x-2 shadow-lg shadow-[#047857]/20 transition-all transform hover:scale-105"
      >
        <MessageSquare size={18} />
        <span className="text-xs uppercase tracking-wider">Chat Infoway</span>
      </button>

      {/* Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#CBD5E1] rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#ECFDF5] rounded-xl text-[#047857] border border-[#A7F3D0]">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] flex items-center space-x-1.5">
                    <span>FinSight Infoway</span>
                    <Sparkles size={13} className="text-[#047857]" />
                  </h4>
                  <p className="text-[11px] text-[#64748B]">Stateless Asynchronous Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFFFFF]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      m.role === "user" ? "bg-[#047857] text-white font-bold" : "bg-[#F1F5F9] border border-[#CBD5E1] text-[#047857] font-bold"
                    }`}
                  >
                    {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[#047857] text-white rounded-tr-none shadow-sm"
                        : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-tl-none font-sans"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center space-x-2 text-xs text-[#64748B] bg-[#F8FAFC] px-3 py-2 rounded-xl w-fit border border-[#E2E8F0]">
                  <div className="w-3 h-3 border-2 border-[#047857] border-t-transparent rounded-full animate-spin" />
                  <span>Infoway is thinking...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about salary 8L, TCS price, or Nifty sentiment..."
                className="flex-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#047857]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="finovate-btn-primary p-2.5 text-xs font-bold"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
