import { RefreshCw, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import type { InventoryFilters as InventoryFiltersState, InventoryStockStatus, WarehouseResponse } from "@/features/inventory/types/inventoryTypes";

type InventoryFiltersProps = {
  filters: InventoryFiltersState;
  warehouses: WarehouseResponse[];
  loading: boolean;
  hasActiveFilters: boolean;
  onChange: (filters: Partial<InventoryFiltersState>) => void;
  onReset: () => void;
  onRefresh: () => void;
};

const stockStatusOptions: Array<{ value: InventoryStockStatus | "all"; label: string }> = [
  { value: "all", label: "Todos los estados" },
  { value: "available", label: "Disponible" },
  { value: "low", label: "Stock bajo" },
  { value: "out", label: "Sin stock" },
  { value: "inactive", label: "Inactivo" }
];

export function InventoryFilters({
  filters,
  warehouses,
  loading,
  hasActiveFilters,
  onChange,
  onReset,
  onRefresh
}: InventoryFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_220px_220px_auto]">
        <TextInput
          label="Buscar producto"
          name="inventory-search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Nombre, SKU o descripcion"
          leadingIcon={<Search className="h-4 w-4" aria-hidden="true" />}
        />

        <label className="block text-sm font-semibold text-slate-800">
          Estado
          <select
            className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
            value={filters.stockStatus}
            onChange={(event) => onChange({ stockStatus: event.target.value as InventoryFiltersState["stockStatus"] })}
          >
            {stockStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Bodega
          <select
            className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
            value={filters.warehouseId}
            onChange={(event) => onChange({ warehouseId: event.target.value })}
            disabled={warehouses.length === 0}
          >
            <option value="all">Todas las bodegas</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={String(warehouse.id)}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <Button type="button" variant="secondary" className="min-h-12 flex-1 lg:flex-none" onClick={onRefresh} disabled={loading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar
          </Button>
          {hasActiveFilters ? (
            <Button type="button" variant="ghost" className="min-h-12 px-3" onClick={onReset} aria-label="Limpiar filtros">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>

      <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
          checked={filters.activeOnly}
          onChange={(event) => onChange({ activeOnly: event.target.checked })}
        />
        Mostrar solo productos activos
      </label>
    </section>
  );
}
