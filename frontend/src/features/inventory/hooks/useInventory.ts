import { useCallback, useEffect, useMemo, useState } from "react";
import { getSafeErrorMessage } from "@/lib/api/apiErrors";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import type {
  CreateProductRequest,
  CreateStockMovementRequest,
  InventoryFilters,
  InventoryItem,
  InventorySummary,
  WarehouseResponse
} from "@/features/inventory/types/inventoryTypes";

const DEFAULT_FILTERS: InventoryFilters = {
  query: "",
  stockStatus: "all",
  warehouseId: "all",
  activeOnly: true
};

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await inventoryApi.getInventory();
      setItems(response.items);
      setWarehouses(response.warehouses);
    } catch (loadError) {
      setError(getSafeErrorMessage(loadError));
      setItems([]);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const filteredItems = useMemo(() => filterInventory(items, filters), [filters, items]);
  const summary = useMemo(() => calculateSummary(items), [items]);
  const hasActiveFilters = filters.query.trim() !== "" || filters.stockStatus !== "all" || filters.warehouseId !== "all" || !filters.activeOnly;

  const updateFilters = useCallback((nextFilters: Partial<InventoryFilters>) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const createProduct = useCallback(
    async (input: CreateProductRequest) => {
      setSaving(true);
      setError(null);

      try {
        await inventoryApi.createProduct(input);
        await loadInventory();
      } catch (createError) {
        const safeMessage = getSafeErrorMessage(createError);
        setError(safeMessage);
        throw new Error(safeMessage);
      } finally {
        setSaving(false);
      }
    },
    [loadInventory]
  );

  const createStockMovement = useCallback(
    async (input: CreateStockMovementRequest) => {
      setSaving(true);
      setError(null);

      try {
        await inventoryApi.createStockMovement(input);
        await loadInventory();
      } catch (movementError) {
        const safeMessage = getSafeErrorMessage(movementError);
        setError(safeMessage);
        throw new Error(safeMessage);
      } finally {
        setSaving(false);
      }
    },
    [loadInventory]
  );

  const getItemDetail = useCallback(async (productId: number) => inventoryApi.getInventoryItemById(productId), []);

  return {
    items,
    filteredItems,
    warehouses,
    filters,
    summary,
    loading,
    saving,
    error,
    isEmpty: !loading && !error && items.length === 0,
    hasNoResults: !loading && !error && items.length > 0 && filteredItems.length === 0,
    hasActiveFilters,
    updateFilters,
    resetFilters,
    refresh: loadInventory,
    createProduct,
    createStockMovement,
    getItemDetail
  };
}

function filterInventory(items: InventoryItem[], filters: InventoryFilters): InventoryItem[] {
  const query = normalizeText(filters.query);
  const selectedWarehouseId = filters.warehouseId === "all" ? null : Number(filters.warehouseId);

  return items.filter((item) => {
    if (filters.activeOnly && !item.active) {
      return false;
    }

    if (filters.stockStatus !== "all" && item.stockStatus !== filters.stockStatus) {
      return false;
    }

    if (selectedWarehouseId && !item.warehouseStocks.some((stock) => stock.warehouseId === selectedWarehouseId)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchableText = normalizeText(`${item.sku} ${item.name} ${item.description ?? ""}`);
    return searchableText.includes(query);
  });
}

function calculateSummary(items: InventoryItem[]): InventorySummary {
  return {
    totalProducts: items.length,
    availableStock: items.reduce((total, item) => total + Math.max(item.totalQuantity, 0), 0),
    lowStock: items.filter((item) => item.stockStatus === "low").length,
    outOfStock: items.filter((item) => item.stockStatus === "out").length
  };
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("es-CL");
}
