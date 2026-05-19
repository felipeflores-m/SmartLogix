import { useCallback, useRef, useState } from "react";
import { getSafeErrorMessage } from "@/lib/api/apiErrors";
import { shipmentsApi } from "@/features/shipments/api/shipmentsApi";
import type { Shipment, ShipmentHistoryEvent } from "@/features/shipments/types/shipmentTypes";

export function useShipmentDetail() {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const openShipment = useCallback(async (shipmentId: number) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);

    try {
      const [shipmentResponse, historyResponse] = await Promise.all([
        shipmentsApi.getShipmentById(shipmentId),
        shipmentsApi.getShipmentHistory(shipmentId).catch(() => [])
      ]);

      if (requestIdRef.current === requestId) {
        setShipment(shipmentResponse);
        setHistory(historyResponse);
      }
    } catch (detailError) {
      if (requestIdRef.current === requestId) {
        setShipment(null);
        setHistory([]);
        setError(getSafeErrorMessage(detailError));
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  const closeShipment = useCallback(() => {
    requestIdRef.current += 1;
    setShipment(null);
    setHistory([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    shipment,
    history,
    loading,
    error,
    openShipment,
    closeShipment
  };
}
