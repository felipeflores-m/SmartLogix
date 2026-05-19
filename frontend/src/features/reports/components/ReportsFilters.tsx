import { RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ApiCarrier } from "@/features/carriers/types/carrierTypes";
import type { WarehouseResponse } from "@/features/inventory/types/inventoryTypes";
import { REPORT_TYPE_LABELS, type ReportFilters, type ReportType } from "@/features/reports/types/reportTypes";

type ReportsFiltersProps = {
  filters: ReportFilters;
  warehouses: WarehouseResponse[];
  carriers: ApiCarrier[];
  statusOptions: Array<{ value: string; label: string }>;
  loading: boolean;
  hasActiveFilters: boolean;
  onChange: (filters: Partial<ReportFilters>) => void;
  onReset: () => void;
  onRefresh: () => void;
};

const selectClassName =
  "mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-all duration-150 hover:border-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const reportTypes: ReportType[] = ["general", "inventory", "orders", "shipments", "carriers", "warehouses"];

export function ReportsFilters({
  carriers,
  filters,
  hasActiveFilters,
  loading,
  onChange,
  onRefresh,
  onReset,
  statusOptions,
  warehouses
}: ReportsFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[160px_160px_180px_190px_220px_220px_auto]">
        <label className="block text-sm font-semibold text-slate-800">
          Desde
          <input
            className={selectClassName}
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Hasta
          <input
            className={selectClassName}
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange({ dateTo: event.target.value })}
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Tipo
          <select
            className={selectClassName}
            value={filters.reportType}
            onChange={(event) => onChange({ reportType: event.target.value as ReportType })}
          >
            {reportTypes.map((reportType) => (
              <option key={reportType} value={reportType}>
                {REPORT_TYPE_LABELS[reportType]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Estado
          <select className={selectClassName} value={filters.status} onChange={(event) => onChange({ status: event.target.value })}>
            <option value="all">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Bodega
          <select
            className={selectClassName}
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

        <label className="block text-sm font-semibold text-slate-800">
          Transportista
          <select
            className={selectClassName}
            value={filters.carrierCode}
            onChange={(event) => onChange({ carrierCode: event.target.value })}
            disabled={carriers.length === 0}
          >
            <option value="all">Todos los transportistas</option>
            {carriers.map((carrier) => (
              <option key={carrier.code} value={carrier.code}>
                {carrier.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="secondary" className="min-h-12 px-3" onClick={onRefresh} disabled={loading} aria-label="Actualizar reportes">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar reportes</TooltipContent>
          </Tooltip>

          {hasActiveFilters ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" className="min-h-12 px-3" onClick={onReset} aria-label="Limpiar filtros">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Limpiar filtros</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </section>
  );
}
