import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  HealthEvaluationResponse,
  RecommendationResponse,
  evaluateFinancialHealth,
  fetchRecommendations,
} from "../services/api";
import { ThemeColors, DARK_COLORS, LIGHT_COLORS } from "../theme/colors";

interface AppContextType {
  // Theme management
  themeMode: "dark" | "light";
  toggleTheme: () => void;
  colors: ThemeColors;

  // Clean slate data
  salary: number | null;
  setSalary: (salary: number | null) => void;
  creditScore: number | null;
  setCreditScore: (score: number | null) => void;
  hasLoan: boolean;
  setHasLoan: (has: boolean) => void;
  loanAmount: number;
  setLoanAmount: (amount: number) => void;
  emergencyFund: boolean;
  setEmergencyFund: (fund: boolean) => void;

  // Evaluation results
  healthResult: HealthEvaluationResponse | null;
  evaluatingHealth: boolean;
  auditSolvency: () => Promise<HealthEvaluationResponse>;

  // ML Recommendations
  selectedRisk: "Low" | "Medium" | "High";
  setSelectedRisk: (risk: "Low" | "Medium" | "High") => void;
  recommendation: RecommendationResponse | null;
  loadingRecommendation: boolean;
  runRecommendation: (riskOverride?: "Low" | "Medium" | "High") => Promise<RecommendationResponse>;

  // Clean slate reset
  resetAllData: () => void;
  isAudited: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Theme state: defaults to dark (Obsidian & Champagne Gold)
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };
  const colors = themeMode === "dark" ? DARK_COLORS : LIGHT_COLORS;

  // Strict clean-slate: no pre-filled salary or credit score
  const [salary, setSalary] = useState<number | null>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [hasLoan, setHasLoan] = useState<boolean>(false);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [emergencyFund, setEmergencyFund] = useState<boolean>(true);

  const [healthResult, setHealthResult] = useState<HealthEvaluationResponse | null>(null);
  const [evaluatingHealth, setEvaluatingHealth] = useState<boolean>(false);

  const [selectedRisk, setSelectedRisk] = useState<"Low" | "Medium" | "High">("Medium");
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState<boolean>(false);

  const auditSolvency = async (): Promise<HealthEvaluationResponse> => {
    if (salary === null || creditScore === null) {
      throw new Error("Income and credit score are required for solvency audit");
    }
    setEvaluatingHealth(true);
    try {
      const res = await evaluateFinancialHealth({
        salary_inr: salary,
        credit_score: creditScore,
        has_loan: hasLoan,
        loan_amount: hasLoan ? loanAmount : 0,
        emergency_fund: emergencyFund,
      });
      setHealthResult(res);
      return res;
    } finally {
      setEvaluatingHealth(false);
    }
  };

  const runRecommendation = async (riskOverride?: "Low" | "Medium" | "High"): Promise<RecommendationResponse> => {
    const activeRisk = riskOverride || selectedRisk;
    setLoadingRecommendation(true);
    try {
      const res = await fetchRecommendations({
        risk_tolerance: activeRisk,
        salary_inr: salary ?? undefined,
        has_loan: hasLoan,
      });
      setRecommendation(res);
      return res;
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const resetAllData = () => {
    setSalary(null);
    setCreditScore(null);
    setHasLoan(false);
    setLoanAmount(0);
    setEmergencyFund(true);
    setHealthResult(null);
    setRecommendation(null);
    setSelectedRisk("Medium");
  };

  return (
    <AppContext.Provider
      value={{
        themeMode,
        toggleTheme,
        colors,
        salary,
        setSalary,
        creditScore,
        setCreditScore,
        hasLoan,
        setHasLoan,
        loanAmount,
        setLoanAmount,
        emergencyFund,
        setEmergencyFund,
        healthResult,
        evaluatingHealth,
        auditSolvency,
        selectedRisk,
        setSelectedRisk,
        recommendation,
        loadingRecommendation,
        runRecommendation,
        resetAllData,
        isAudited: healthResult !== null,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
