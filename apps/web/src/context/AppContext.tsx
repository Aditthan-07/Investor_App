"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { evaluateFinancialHealth, fetchRecommendations } from "@/lib/api";

export interface UserProfile {
  salary: number | null;
  creditScore: number | null;
  hasLoan: boolean;
  loanAmount: number;
  emergencyFund: boolean | null;
}

export interface HealthData {
  health_score: number;
  health_tier: string;
  is_locked: boolean;
  salary_score: number;
  credit_score_val: number;
  debt_score: number;
  emergency_score: number;
  recommendation_summary: string;
  radar_metrics: Array<{ subject: string; score: number }>;
}

export interface RecommendationData {
  risk_profile: string;
  confidence: number;
  feature_importances: Record<string, number>;
  explanation: string;
  target_asset_allocation: Record<string, number>;
  recommended_stocks: Array<{
    ticker: string;
    company_name: string;
    current_price: number;
    two_week_change_pct: number;
    allocation_pct: number;
    asset_class: string;
    website_url?: string;
    chart_url?: string;
  }>;
}

interface AppContextType {
  profile: UserProfile;
  health: HealthData | null;
  recommendation: RecommendationData | null;
  canContinue: boolean;
  isLocked: boolean;
  riskTolerance: string;
  setRiskTolerance: (tier: string) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  evaluateHealth: () => Promise<HealthData | null>;
  generateRecommendations: () => Promise<RecommendationData | null>;
  resetAllData: () => void;
  unlockHackerOverride: () => void;
}

const defaultProfile: UserProfile = {
  salary: null,
  creditScore: null,
  hasLoan: false,
  loanAmount: 0,
  emergencyFund: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [riskTolerance, setRiskTolerance] = useState<string>("Medium");
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Load from local storage if available
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("finsight_user_profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      const savedHealth = localStorage.getItem("finsight_health");
      if (savedHealth) {
        const parsed = JSON.parse(savedHealth);
        setHealth(parsed);
        setCanContinue(parsed.health_tier === "Fair" || parsed.health_tier === "Good");
        setIsLocked(parsed.health_tier === "Poor");
      }
      const savedReco = localStorage.getItem("finsight_reco");
      if (savedReco) {
        setRecommendation(JSON.parse(savedReco));
      }
    } catch (e) {}
  }, []);

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem("finsight_user_profile", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const evaluateHealth = async (): Promise<HealthData | null> => {
    if (profile.salary === null || profile.creditScore === null) return null;

    try {
      const res = await evaluateFinancialHealth({
        salary_inr: profile.salary,
        credit_score: profile.creditScore,
        has_loan: profile.hasLoan,
        loan_amount: profile.loanAmount,
        emergency_fund: profile.emergencyFund === true,
      });

      setHealth(res);
      const allow = res.health_tier === "Fair" || res.health_tier === "Good";
      const lock = res.health_tier === "Poor";
      setCanContinue(allow);
      setIsLocked(lock);

      try {
        localStorage.setItem("finsight_health", JSON.stringify(res));
      } catch (e) {}

      return res;
    } catch (e) {
      console.error("Health evaluation failed", e);
      return null;
    }
  };

  const generateRecommendations = async (): Promise<RecommendationData | null> => {
    try {
      const res = await fetchRecommendations({
        risk_tolerance: riskTolerance,
        salary_inr: profile.salary || 600000,
        has_loan: profile.hasLoan,
      });

      setRecommendation(res);
      try {
        localStorage.setItem("finsight_reco", JSON.stringify(res));
      } catch (e) {}
      return res;
    } catch (e) {
      console.error("Recommendation failed", e);
      return null;
    }
  };

  const resetAllData = () => {
    setProfile(defaultProfile);
    setHealth(null);
    setRecommendation(null);
    setRiskTolerance("Medium");
    setCanContinue(false);
    setIsLocked(false);
    try {
      localStorage.removeItem("finsight_user_profile");
      localStorage.removeItem("finsight_health");
      localStorage.removeItem("finsight_reco");
    } catch (e) {}
  };

  const unlockHackerOverride = () => {
    setIsLocked(false);
    setCanContinue(true);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        health,
        recommendation,
        canContinue,
        isLocked,
        riskTolerance,
        setRiskTolerance,
        updateProfile,
        evaluateHealth,
        generateRecommendations,
        resetAllData,
        unlockHackerOverride,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
