import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getSafeErrorMessage } from "@/lib/api/apiErrors";
import { shipmentsApi } from "@/features/shipments/api/shipmentsApi";
import type {
  Shipment,
  ShipmentCarrier,
  ShipmentFilters,
  ShipmentStatus,
  ShipmentSummary,
  UpdateShipmentStatusRequest
} from "@/features/shipments/types/shipmentTypes";

const DEFAULT_FILTERS: ShipmentFilters = {
  query: "",
  status: "all",
  carrierCode: "all"
};

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filters, setFilters] = useState<ShipmentFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(filters.query, 400);

  const effectiveFilters = useMemo(() => ({ ...filters, query: debouncedQuery }), [debouncedQuery, filters]);
  const filteredShipments = useMemo(() => filterShipments(shipments, effectiveFilters), [effectiveFilters, shipments]);
  const summary = useMemo(() => calculateSummary(shipments), [shipments]);
  const carriers = useMemo(() => getShipmentCarriers(shipments), [shipments]);
  const hasActiveFilters = Boolean(filters.query.trim() || filters.status !== "all" || filters.carrierCode !== "all");
  const searching = filters.query !== debouncedQuery;

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setShipments(await shipmentsApi.getShipments());
    } catch (loadError) {
      setShipments([]);
      setError(getSafeErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  const updateFilters = useCallback((nextFilters: Partial<ShipmentFilters>) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const updateShipmentStatus = useCallback(
    async (shipmentId: number, input: UpdateShipmentStatusRequest) => {
      setSaving(true);
      setError(null);

      try {
        await shipmentsApi.updateShipmentStatus(shipmentId, input);
        await loadShipments();
      } catch (statusError) {
        throw new Error(getSafeErrorMessage(statusError));
      } finally {
        setSaving(false);
      }
    },
    [loadShipments]
  );

  const cancelShipment = useCallback(
    async (shipmentId: number) => {
      setSaving(true);
      setError(null);

      try {
        await shipmentsApi.cancelShipment(shipmentId);
        await loadShipments();
      } catch (cancelError) {
        throw new Error(getSafeErrorMessage(cancelError));
      } finally {
        setSaving(false);
      }
    },
    [loadShipments]
  );

  return {
    shipments,
    filteredShipments,
    filters,
    summary,
    carriers,
    loading,
    saving,
    searching,
    error,
    isEmpty: !loading && !error && shipments.length === 0,
    hasNoResults: !loading && !error && shipments.length > 0 && filteredShipments.length === 0,
    hasActiveFilters,
    updateFilters,
    resetFilters,
    refresh: loadShipments,
    updateShipmentStatus,
    cancelShipment
  };
}

function filterShipments(shipments: Shipment[], filters: ShipmentFilters): Shipment[] {
  const query = normalizeText(filters.query);

  return shipments.filter((shipment) => {
    if (filters.status !== "all" && shipment.status !== filters.status) {
      return false;
    }

    if (filters.carrierCode !== "all" && shipment.carrier?.code !== filters.carrierCode) {
      return false;
    }

    if (!query) {
      return true;
    }

    return normalizeText(
      [
        shipment.shipmentNumber,
        shipment.orderNumber,
        shipment.carrier?.name ?? "",
        shipment.carrier?.code ?? "",
        shipment.trackingCode ?? "",
        shipment.destinationCity ?? "",
        shipment.status
      ].join(" ")
    ).includes(query);
  });
}

function calculateSummary(shipments: Shipment[]): ShipmentSummary {
  return {
    totalShipments: shipments.length,
    pendingShipments: shipments.filter((shipment) => shipment.status === "CREATED" || shipment.status === "PENDING_ASSIGNMENT").length,
    assignedShipments: shipments.filter((shipment) => shipment.status === "ASSIGNED").length,
    inTransitShipments: shipments.filter((shipment) => shipment.status === "IN_TRANSIT").length,
    deliveredShipments: shipments.filter((shipment) => shipment.status === "DELIVERED").length,
    incidentShipments: shipments.filter((shipment) => shipment.status === "FAILED" || shipment.status === "CANCELLED").length
  };
}

function getShipmentCarriers(shipments: Shipment[]): ShipmentCarrier[] {
  const carriers = new Map<string, ShipmentCarrier>();

  shipments.forEach((shipment) => {
    if (shipment.carrier) {
      carriers.set(shipment.carrier.code, shipment.carrier);
    }
  });

  return Array.from(carriers.values()).sort((first, second) => first.name.localeCompare(second.name, "es-CL"));
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("es-CL");
}

export type ShipmentFilterStatus = ShipmentStatus | "all";
