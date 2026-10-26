import AsyncStorage from "@react-native-async-storage/async-storage";
import { HealthEvaluationResponse, RecommendationResponse } from "./api";

export interface UserFinancialProfile {
  salary: number | null;
  creditScore: number | null;
  hasLoan: boolean;
  loanAmount: number;
  emergencyFund: boolean;
  healthResult: HealthEvaluationResponse | null;
  recommendation?: RecommendationResponse | null;
  selectedRisk?: "Low" | "Medium" | "High";
  updatedAt: string;
}

const SESSION_KEY = "@finsight_session_user";

/**
 * Register a new user in local persistent storage.
 */
export async function registerUser(username: string, password: string):Promise<{ success: boolean; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (!password || password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters." };
  }

  try {
    const existing = await AsyncStorage.getItem(`@user_${cleanUsername}`);
    if (existing) {
      return { success: false, error: "Username already exists. Please sign in." };
    }
    const payload = JSON.stringify({
      username: cleanUsername,
      password, // In local demo context
      createdAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(`@user_${cleanUsername}`, payload);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save user credentials." };
  }
}

/**
 * Verify credentials for an existing user.
 */
export async function verifyUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();
  try {
    const record = await AsyncStorage.getItem(`@user_${cleanUsername}`);
    if (!record) {
      return { success: false, error: "Account not found. Please register." };
    }
    const parsed = JSON.parse(record);
    if (parsed.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: "Verification failed." };
  }
}

/**
 * Manage active session.
 */
export async function saveSession(username: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, username.trim().toLowerCase());
  } catch (e) {
    // Handled silently
  }
}

export async function getSession(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch (e) {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    // Handled silently
  }
}

/**
 * Persist user financial figures and calculated solvency audit.
 */
export async function saveUserFinancialProfile(
  username: string,
  data: Partial<UserFinancialProfile>
): Promise<void> {
  const cleanUsername = username.trim().toLowerCase();
  const key = `@financials_${cleanUsername}`;
  try {
    const existingStr = await AsyncStorage.getItem(key);
    const existing: Partial<UserFinancialProfile> = existingStr ? JSON.parse(existingStr) : {};
    const updated: UserFinancialProfile = {
      salary: data.salary !== undefined ? data.salary : (existing.salary ?? null),
      creditScore: data.creditScore !== undefined ? data.creditScore : (existing.creditScore ?? null),
      hasLoan: data.hasLoan !== undefined ? data.hasLoan : (existing.hasLoan ?? false),
      loanAmount: data.loanAmount !== undefined ? data.loanAmount : (existing.loanAmount ?? 0),
      emergencyFund: data.emergencyFund !== undefined ? data.emergencyFund : (existing.emergencyFund ?? true),
      healthResult: data.healthResult !== undefined ? data.healthResult : (existing.healthResult ?? null),
      recommendation: data.recommendation !== undefined ? data.recommendation : (existing.recommendation ?? null),
      selectedRisk: data.selectedRisk !== undefined ? data.selectedRisk : (existing.selectedRisk ?? "Medium"),
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    // Handled silently
  }
}

/**
 * Retrieve saved user financial profile.
 */
export async function getUserFinancialProfile(username: string): Promise<UserFinancialProfile | null> {
  const cleanUsername = username.trim().toLowerCase();
  const key = `@financials_${cleanUsername}`;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Clear stored financial data for clean-slate re-audit.
 */
export async function clearUserFinancialProfile(username: string): Promise<void> {
  const cleanUsername = username.trim().toLowerCase();
  const key = `@financials_${cleanUsername}`;
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // Handled silently
  }
}
