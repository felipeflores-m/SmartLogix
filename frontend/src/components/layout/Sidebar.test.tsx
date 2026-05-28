import { render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthContext, type AuthContextValue } from "@/features/auth/hooks/AuthContext";
import type { AuthRole } from "@/features/auth/types/authTypes";

describe("Sidebar", () => {
  it("shows settings only for ADMIN", () => {
    render(
      <AuthProvider role="ADMIN">
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole("link", { name: /configuracion/i })).toBeInTheDocument();
  });

  it("hides settings for OPERATOR", () => {
    render(
      <AuthProvider role="OPERATOR">
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.queryByRole("link", { name: /configuracion/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pedidos/i })).toBeInTheDocument();
  });
});

function AuthProvider({ children, role }: PropsWithChildren<{ role: AuthRole }>) {
  const user = {
    id: 1,
    email: "user@smartlogix.cl",
    fullName: "Usuario SmartLogix",
    role,
    active: true
  };
  const value: AuthContextValue = {
    user,
    loading: false,
    checkingSession: false,
    error: null,
    status: "authenticated",
    isAuthenticated: true,
    authUnavailable: false,
    hasStoredToken: true,
    login: vi.fn(async () => user),
    logout: vi.fn(async () => undefined),
    checkSession: vi.fn(async () => undefined),
    clearError: vi.fn()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
