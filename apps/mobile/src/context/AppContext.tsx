import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  HealthEvaluationResponse,
  RecommendationResponse,
  evaluateFinancialHealth,
  fetchRecommendations,
} from "../services/api";
import { ThemeColors, DARK_COLORS, LIGHT_COLORS } from "../theme/colors";
import {
  getSession,
  saveSession,
  clearSession,
  registerUser,
  verifyUser,
  getUserFinancialProfile,
  saveUserFinancialProfile,
  clearUserFinancialProfile,
  UserFinancialProfile,
} from "../services/storage";

interface AppContextType {
  // Theme management
  themeMode: "dark" | "light";
  toggleTheme: () => void;
  colors: ThemeColors;

  // User Auth & Session
  currentUser: string | null;
  isAuthenticated: boolean;
  authModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;

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

  // Clean slate reset & persistence
  resetAllData: () => void;
  clearCurrentProfile: () => Promise<void>;
  saveCurrentInputs: (customData?: Partial<UserFinancialProfile>) => Promise<void>;
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

  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authModalVisible, setAuthModalVisible] = useState<boolean>(false);

  // Financial inputs
  const [salary, setSalary] = useState<number | null>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [hasLoan, setHasLoan] = useState<boolean>(false);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [emergencyFund, setEmergencyFund] = useState<boolean>(true);

  // Health & Recommendation results
  const [healthResult, setHealthResult] = useState<HealthEvaluationResponse | null>(null);
  const [evaluatingHealth, setEvaluatingHealth] = useState<boolean>(false);

  const [selectedRisk, setSelectedRisk] = useState<"Low" | "Medium" | "High">("Medium");
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState<boolean>(false);

  // Hydrate session and financial data on initial launch
  useEffect(() => {
    async function hydrate() {
      try {
        const sessionUser = await getSession();
        if (sessionUser) {
          setCurrentUser(sessionUser);
          setIsAuthenticated(true);
          const profile = await getUserFinancialProfile(sessionUser);
          if (profile) {
            if (profile.salary !== null && profile.salary !== undefined) setSalary(profile.salary);
            if (profile.creditScore !== null && profile.creditScore !== undefined) setCreditScore(profile.creditScore);
            if (profile.hasLoan !== undefined) setHasLoan(profile.hasLoan);
            if (profile.loanAmount !== undefined) setLoanAmount(profile.loanAmount);
            if (profile.emergencyFund !== undefined) setEmergencyFund(profile.emergencyFund);
            if (profile.healthResult) setHealthResult(profile.healthResult);
            if (profile.recommendation) setRecommendation(profile.recommendation);
            if (profile.selectedRisk) setSelectedRisk(profile.selectedRisk);
          }
        } else {
          // Prompt user authentication on first visit
          setAuthModalVisible(true);
        }
      } catch (e) {
        // Hydration error fallback
      }
    }
    hydrate();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await verifyUser(username, password);
    if (!res.success) return res;

    const cleanUser = username.trim().toLowerCase();
    await saveSession(cleanUser);
    setCurrentUser(cleanUser);
    setIsAuthenticated(true);
    setAuthModalVisible(false);

    // Hydrate user profile
    const profile = await getUserFinancialProfile(cleanUser);
    if (profile) {
      if (profile.salary !== null && profile.salary !== undefined) setSalary(profile.salary);
      if (profile.creditScore !== null && profile.creditScore !== undefined) setCreditScore(profile.creditScore);
      if (profile.hasLoan !== undefined) setHasLoan(profile.hasLoan);
      if (profile.loanAmount !== undefined) setLoanAmount(profile.loanAmount);
      if (profile.emergencyFund !== undefined) setEmergencyFund(profile.emergencyFund);
      if (profile.healthResult) setHealthResult(profile.healthResult);
      if (profile.recommendation) setRecommendation(profile.recommendation);
      if (profile.selectedRisk) setSelectedRisk(profile.selectedRisk);
    }
    return { success: true };
  };

  const signUp = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const regRes = await registerUser(username, password);
    if (!regRes.success) return regRes;
    return login(username, password);
  };

  const continueAsGuest = () => {
    setCurrentUser("Guest Investor");
    setIsAuthenticated(true);
    setAuthModalVisible(false);
  };

  const logout = async () => {
    await clearSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
    resetAllData();
    setAuthModalVisible(true);
  };

  const saveCurrentInputs = async (customData?: Partial<UserFinancialProfile>) => {
    if (!currentUser) return;
    await saveUserFinancialProfile(currentUser, {
      salary,
      creditScore,
      hasLoan,
      loanAmount,
      emergencyFund,
      healthResult,
      recommendation,
      selectedRisk,
      ...customData,
    });
  };

  const clearCurrentProfile = async () => {
    if (currentUser) {
      await clearUserFinancialProfile(currentUser);
    }
    resetAllData();
  };

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
      // Auto-persist evaluation result
      if (currentUser) {
        saveUserFinancialProfile(currentUser, {
          salary,
          creditScore,
          hasLoan,
          loanAmount: hasLoan ? loanAmount : 0,
          emergencyFund,
          healthResult: res,
        });
      }
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
        loan_amount: hasLoan ? loanAmount : 0,
      });
      setRecommendation(res);
      // Auto-persist recommendation result
      if (currentUser) {
        saveUserFinancialProfile(currentUser, {
          recommendation: res,
          selectedRisk: activeRisk,
        });
      }
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
        currentUser,
        isAuthenticated,
        authModalVisible,
        setAuthModalVisible,
        login,
        signUp,
        continueAsGuest,
        logout,
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
        clearCurrentProfile,
        saveCurrentInputs,
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
