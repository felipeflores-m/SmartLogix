import { useCallback, useEffect, useState } from "react";
import { getSafeErrorMessage } from "@/lib/api/apiErrors";
import type { HealthCheckResponse } from "@/lib/api/apiTypes";
import { backendStatusApi } from "@/services/backendStatusApi";

export function useBackendStatus() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await backendStatusApi.getHealth();
      setHealth(response);
    } catch (healthError) {
      setHealth(null);
      setError(getSafeErrorMessage(healthError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    health,
    loading,
    error,
    refresh
  };
}
