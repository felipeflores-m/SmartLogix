import { Download, RadioTower, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/toastContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CarriersReportSection } from "@/features/reports/components/CarriersReportSection";
import { InventoryReportSection } from "@/features/reports/components/InventoryReportSection";
import { OrdersReportSection } from "@/features/reports/components/OrdersReportSection";
import { ReportChartCard } from "@/features/reports/components/ReportChartCard";
import { ReportEmptyState } from "@/features/reports/components/ReportEmptyState";
import { ReportErrorState } from "@/features/reports/components/ReportErrorState";
import { ReportsFilters } from "@/features/reports/components/ReportsFilters";
import { ReportsSummaryCards } from "@/features/reports/components/ReportsSummaryCards";
import { ShipmentsReportSection } from "@/features/reports/components/ShipmentsReportSection";
import { WarehousesReportSection } from "@/features/reports/components/WarehousesReportSection";
import { useReports } from "@/features/reports/hooks/useReports";
import type { ReportCsvRow, ReportType, ReportsData } from "@/features/reports/types/reportTypes";
import { useBackendStatus } from "@/hooks/useBackendStatus";

export function ReportsPage() {
  const reports = useReports();
  const { health, loading: statusLoading } = useBackendStatus();
  const toast = useToast();
  const isBackendUp = health?.status === "UP";
  const canExport = !reports.loading && !reports.error && reports.data.csvRows.length > 0 && !reports.isEmpty && !reports.hasNoResults;

  function shouldShowSection(section: Exclude<ReportType, "general">): boolean {
    return reports.filters.reportType === "general" || reports.filters.reportType === section;
  }

  function handleExportCsv() {
    if (!canExport) {
      toast.error("No hay informacion disponible para exportar.");
      return;
    }

    exportCsv(reports.data.csvRows);
    toast.success("Reporte exportado correctamente.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Indicadores operacionales</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Reportes</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Visualiza indicadores operacionales de inventario, pedidos y despachos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <RadioTower className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <StatusBadge
                  label={statusLoading ? "Verificando" : isBackendUp ? "Sistema operativo" : "Sin conexion"}
                  tone={statusLoading ? "neutral" : isBackendUp ? "success" : "danger"}
                />
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="secondary" onClick={() => void reports.refresh()} disabled={reports.loading}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Actualizar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar reportes</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" onClick={handleExportCsv} disabled={!canExport}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Exportar CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar datos visibles</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>

      <ReportsSummaryCards summary={reports.data.summary} loading={reports.loading} />

      <ReportsFilters
        filters={reports.filters}
        warehouses={reports.warehouses}
        carriers={reports.carriers}
        statusOptions={reports.statusOptions}
        loading={reports.loading}
        hasActiveFilters={reports.hasActiveFilters}
        onChange={reports.updateFilters}
        onReset={reports.resetFilters}
        onRefresh={() => void reports.refresh()}
      />

      {reports.referenceError && !reports.error ? (
        <FormMessage tone="info">Algunos indicadores pueden estar temporalmente sin informacion.</FormMessage>
      ) : null}

      {reports.error ? (
        <ReportErrorState message={reports.error} loading={reports.loading} onRetry={() => void reports.refresh()} />
      ) : reports.isEmpty || reports.hasNoResults ? (
        <ReportEmptyState hasActiveFilters={reports.hasActiveFilters} onResetFilters={reports.resetFilters} />
      ) : (
        <div className="space-y-6">
          {reports.filters.reportType === "general" ? <GeneralReportSection data={reports.data} /> : null}
          {shouldShowSection("inventory") ? <InventoryReportSection report={reports.data.inventory} /> : null}
          {shouldShowSection("orders") ? <OrdersReportSection report={reports.data.orders} /> : null}
          {shouldShowSection("shipments") ? <ShipmentsReportSection report={reports.data.shipments} /> : null}
          {shouldShowSection("carriers") ? <CarriersReportSection report={reports.data.carriers} /> : null}
          {shouldShowSection("warehouses") ? <WarehousesReportSection report={reports.data.warehouses} /> : null}
        </div>
      )}
    </div>
  );
}

function GeneralReportSection({ data }: { data: ReportsData }) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <ReportChartCard
          title="Resumen operacional"
          description="Indicadores principales calculados desde informacion disponible."
          data={[
            { label: "Productos registrados", value: data.summary.productsRegistered, tone: "blue" },
            { label: "Pedidos totales", value: data.summary.totalOrders, tone: "slate" },
            { label: "Envios en transito", value: data.summary.shipmentsInTransit, tone: "cyan" },
            { label: "Incidencias", value: data.summary.incidents, tone: "red" }
          ]}
        />
        <ReportChartCard
          title="Actividad reciente"
          description="Registros mas recientes por flujo operativo."
          data={[
            { label: "Ultimos pedidos", value: data.orders.latestOrders.length, tone: "blue" },
            { label: "Ultimos envios", value: data.shipments.latestShipments.length, tone: "cyan" },
            { label: "Movimientos de stock", value: data.warehouses.movements.length, tone: "green" }
          ]}
        />
      </div>
    </section>
  );
}

function exportCsv(rows: ReportCsvRow[]) {
  const headers = ["Seccion", "Indicador", "Valor", "Detalle"];
  const content = [headers, ...rows.map((row) => [row.section, row.label, row.value, row.detail])]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "smartlogix-reportes.csv";
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string): string {
  if (!/[",\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}
