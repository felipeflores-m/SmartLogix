import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getSafeErrorMessage } from "@/lib/api/apiErrors";
import { warehousesApi } from "@/features/warehouses/api/warehousesApi";
import {
  warehouseFormToCreateRequest,
  type Warehouse,
  type WarehouseFilters,
  type WarehouseFormValues,
  type WarehouseStatus,
  type WarehouseSummary
} from "@/features/warehouses/types/warehouseTypes";

const DEFAULT_FILTERS: WarehouseFilters = {
  query: "",
  status: "all",
  location: "all"
};

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<WarehouseFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(filters.query, 400);

  const effectiveFilters = useMemo(() => ({ ...filters, query: debouncedQuery }), [debouncedQuery, filters]);
  const filteredWarehouses = useMemo(() => filterWarehouses(warehouses, effectiveFilters), [effectiveFilters, warehouses]);
  const summary = useMemo(() => calculateSummary(warehouses), [warehouses]);
  const locations = useMemo(() => getWarehouseLocations(warehouses), [warehouses]);
  const hasActiveFilters = Boolean(filters.query.trim() || filters.status !== "all" || filters.location !== "all");
  const searching = filters.query !== debouncedQuery;

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await warehousesApi.getWarehouseData();
      setWarehouses(response.warehouses);
    } catch (loadError) {
      setWarehouses([]);
      setError(getSafeErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  const updateFilters = useCallback((nextFilters: Partial<WarehouseFilters>) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const createWarehouse = useCallback(
    async (values: WarehouseFormValues) => {
      setSaving(true);
      setError(null);

      try {
        await warehousesApi.createWarehouse(warehouseFormToCreateRequest(values));
        await loadWarehouses();
      } catch (createError) {
        throw new Error(getSafeErrorMessage(createError));
      } finally {
        setSaving(false);
      }
    },
    [loadWarehouses]
  );

  return {
    warehouses,
    filteredWarehouses,
    filters,
    summary,
    locations,
    loading,
    saving,
    searching,
    error,
    isEmpty: !loading && !error && warehouses.length === 0,
    hasNoResults: !loading && !error && warehouses.length > 0 && filteredWarehouses.length === 0,
    hasActiveFilters,
    updateFilters,
    resetFilters,
    refresh: loadWarehouses,
    createWarehouse
  };
}

function filterWarehouses(warehouses: Warehouse[], filters: WarehouseFilters): Warehouse[] {
  const query = normalizeText(filters.query);

  return warehouses.filter((warehouse) => {
    if (filters.status !== "all" && warehouse.status !== filters.status) {
      return false;
    }

    if (filters.location !== "all" && warehouse.address !== filters.location) {
      return false;
    }

    if (!query) {
      return true;
    }

    return normalizeText([warehouse.code, warehouse.name, warehouse.address ?? ""].join(" ")).includes(query);
  });
}

function calculateSummary(warehouses: Warehouse[]): WarehouseSummary {
  const productIds = new Set<number>();

  warehouses.forEach((warehouse) => {
    warehouse.products.forEach((product) => productIds.add(product.productId));
  });

  return {
    totalWarehouses: warehouses.length,
    activeWarehouses: warehouses.filter((warehouse) => warehouse.active).length,
    inactiveWarehouses: warehouses.filter((warehouse) => !warehouse.active).length,
    associatedProducts: productIds.size,
    totalStock: warehouses.reduce((total, warehouse) => total + warehouse.stockSummary.totalStock, 0),
    lowStock: warehouses.reduce((total, warehouse) => total + warehouse.stockSummary.lowStock, 0)
  };
}

function getWarehouseLocations(warehouses: Warehouse[]): string[] {
  return Array.from(new Set(warehouses.map((warehouse) => warehouse.address).filter((address): address is string => Boolean(address)))).sort(
    (first, second) => first.localeCompare(second, "es-CL")
  );
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("es-CL");
}

export type WarehouseFilterStatus = WarehouseStatus | "all";
