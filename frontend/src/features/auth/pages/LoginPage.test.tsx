import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "@/features/auth/hooks/AuthContext";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import type { AuthUser } from "@/features/auth/types/authTypes";

describe("LoginPage", () => {
  it("submits trimmed credentials and navigates to dashboard", async () => {
    const user = userEvent.setup();
    const loggedUser: AuthUser = {
      id: 1,
      email: "admin@smartlogix.cl",
      fullName: "Admin SmartLogix",
      role: "ADMIN",
      active: true
    };
    const login = vi.fn(async () => loggedUser);

    render(
      <AuthContext.Provider value={authValue(login)}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard operacional</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await user.type(screen.getByLabelText(/correo electronico/i), " admin@smartlogix.cl ");
    await user.type(screen.getByLabelText(/contrasena/i), "Admin123");
    await user.click(screen.getByRole("button", { name: /iniciar sesion/i }));

    expect(login).toHaveBeenCalledWith({ email: "admin@smartlogix.cl", password: "Admin123" });
    expect(await screen.findByText("Dashboard operacional")).toBeInTheDocument();
  });

  it("validates required credentials before submitting", async () => {
    const user = userEvent.setup();
    const login = vi.fn();

    render(
      <AuthContext.Provider value={authValue(login)}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await user.click(screen.getByRole("button", { name: /iniciar sesion/i }));

    expect(screen.getByText("Ingresa tu correo.")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu contrasena.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });
});

function authValue(login: AuthContextValue["login"]): AuthContextValue {
  return {
    user: null,
    loading: false,
    checkingSession: false,
    error: null,
    status: "anonymous",
    isAuthenticated: false,
    authUnavailable: false,
    hasStoredToken: false,
    login,
    logout: vi.fn(async () => undefined),
    checkSession: vi.fn(async () => undefined),
    clearError: vi.fn()
  };
}

