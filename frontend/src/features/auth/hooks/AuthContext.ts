import { createContext } from "react";
import type { LoginRequest, UserResponse } from "@/lib/api/apiTypes";

export type AuthSessionStatus = "checking" | "authenticated" | "anonymous" | "unavailable";

export type AuthContextValue = {
  user: UserResponse | null;
  loading: boolean;
  checkingSession: boolean;
  error: string | null;
  status: AuthSessionStatus;
  isAuthenticated: boolean;
  authUnavailable: boolean;
  hasStoredToken: boolean;
  login: (credentials: LoginRequest) => Promise<UserResponse>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
