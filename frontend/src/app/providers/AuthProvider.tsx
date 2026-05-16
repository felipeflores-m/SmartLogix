import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { AuthContext, type AuthSessionStatus } from "@/features/auth/hooks/AuthContext";
import type { LoginRequest, UserResponse } from "@/lib/api/apiTypes";
import { ApiClientError, getSafeErrorMessage } from "@/lib/api/apiErrors";
import { authTokenProvider } from "@/lib/security/authTokenProvider";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [status, setStatus] = useState<AuthSessionStatus>("checking");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setStatus("checking");
    setError(null);

    if (!authTokenProvider.hasToken()) {
      setUser(null);
      setStatus("anonymous");
      return;
    }

    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch (sessionError) {
      setUser(null);
      setError(getSafeErrorMessage(sessionError));

      if (sessionError instanceof ApiClientError && (sessionError.status === 401 || sessionError.status === 403)) {
        authTokenProvider.clearToken();
        setStatus("anonymous");
        return;
      }

      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setActionLoading(true);
    setError(null);

    try {
      const loginResponse = await authApi.login(credentials);
      authTokenProvider.setToken(loginResponse.accessToken);
      setUser(loginResponse.user);
      setStatus("authenticated");
      return loginResponse.user;
    } catch (loginError) {
      const safeMessage = getSafeErrorMessage(loginError);
      setError(safeMessage);
      setStatus("anonymous");
      throw loginError;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setError(null);
    setStatus("anonymous");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: actionLoading || status === "checking",
      checkingSession: status === "checking",
      error,
      status,
      isAuthenticated: Boolean(user),
      authUnavailable: status === "unavailable",
      hasStoredToken: authTokenProvider.hasToken(),
      login,
      logout,
      checkSession,
      clearError
    }),
    [actionLoading, checkSession, clearError, error, login, logout, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
