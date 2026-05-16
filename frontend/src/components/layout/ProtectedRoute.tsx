import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { authUnavailable, checkSession, checkingSession, error, hasStoredToken, isAuthenticated } = useAuth();

  if (checkingSession) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-panel">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
          <p className="mt-4 text-sm font-semibold text-slate-900">Validando sesion</p>
          <p className="mt-1 text-sm text-slate-500">Confirmando credenciales con SmartLogix.</p>
        </div>
      </div>
    );
  }

  if (authUnavailable && hasStoredToken) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase text-yellow-800">Sesion pendiente de validar</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">No fue posible contactar el backend</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-700">
          {error ?? "La sesion no pudo validarse. Reintenta cuando el sistema este disponible."}
        </p>
        <div className="mt-5">
          <Button type="button" variant="secondary" onClick={() => void checkSession()}>
            Reintentar validacion
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
