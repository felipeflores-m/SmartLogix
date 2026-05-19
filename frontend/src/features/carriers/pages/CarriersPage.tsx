import { RadioTower, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/toastContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CarrierConfirmDialog } from "@/features/carriers/components/CarrierConfirmDialog";
import { CarrierDetailDrawer } from "@/features/carriers/components/CarrierDetailDrawer";
import { CarrierEmptyState } from "@/features/carriers/components/CarrierEmptyState";
import { CarrierErrorState } from "@/features/carriers/components/CarrierErrorState";
import { CarriersFilters } from "@/features/carriers/components/CarriersFilters";
import { CarriersSummaryCards } from "@/features/carriers/components/CarriersSummaryCards";
import { CarriersTable } from "@/features/carriers/components/CarriersTable";
import { useCarrierDetail } from "@/features/carriers/hooks/useCarrierDetail";
import { useCarriers } from "@/features/carriers/hooks/useCarriers";
import type { Carrier } from "@/features/carriers/types/carrierTypes";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { useState } from "react";

export function CarriersPage() {
  const carriers = useCarriers();
  const detail = useCarrierDetail();
  const { health, loading: statusLoading } = useBackendStatus();
  const toast = useToast();
  const [availabilityCarrier, setAvailabilityCarrier] = useState<Carrier | null>(null);
  const isBackendUp = health?.status === "UP";

  function handleViewDetail(carrier: Carrier) {
    void detail.openCarrier(carrier.id);
  }

  async function handleToggleAvailability() {
    if (!availabilityCarrier) {
      return;
    }

    try {
      const nextAvailable = !availabilityCarrier.simulatedAvailable;
      await carriers.updateAvailability(availabilityCarrier, nextAvailable);
      toast.success(nextAvailable ? "Transportista disponible." : "Transportista marcado como no disponible.");
      setAvailabilityCarrier(null);
      detail.closeCarrier();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible completar la operacion.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Gestion logistica</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Transportistas</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Administra proveedores de despacho y disponibilidad logistica.
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
                <Button type="button" variant="secondary" onClick={() => void carriers.refresh()} disabled={carriers.loading}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Actualizar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar transportistas</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>

      <CarriersSummaryCards summary={carriers.summary} loading={carriers.loading} />

      {carriers.referenceError && !carriers.error ? (
        <FormMessage tone="info" title="Informacion parcial">
          Los transportistas estan disponibles, pero algunos despachos asociados no pudieron cargarse.
        </FormMessage>
      ) : null}

      <CarriersFilters
        filters={carriers.filters}
        carriers={carriers.carriers}
        serviceTypes={carriers.serviceTypes}
        loading={carriers.loading}
        searching={carriers.searching}
        hasActiveFilters={carriers.hasActiveFilters}
        onChange={carriers.updateFilters}
        onReset={carriers.resetFilters}
        onRefresh={() => void carriers.refresh()}
      />

      {carriers.error ? (
        <CarrierErrorState message={carriers.error} loading={carriers.loading} onRetry={() => void carriers.refresh()} />
      ) : carriers.isEmpty || carriers.hasNoResults ? (
        <CarrierEmptyState hasActiveFilters={carriers.hasActiveFilters} onResetFilters={carriers.resetFilters} />
      ) : (
        <CarriersTable
          carriers={carriers.filteredCarriers}
          loading={carriers.loading}
          onViewDetail={handleViewDetail}
          onToggleAvailability={setAvailabilityCarrier}
        />
      )}

      <CarrierDetailDrawer
        carrier={detail.carrier}
        shipments={detail.shipments}
        history={detail.history}
        loading={detail.loading}
        error={detail.error}
        onClose={detail.closeCarrier}
        onToggleAvailability={setAvailabilityCarrier}
      />

      <CarrierConfirmDialog
        carrier={availabilityCarrier}
        loading={carriers.saving}
        onClose={() => setAvailabilityCarrier(null)}
        onConfirm={() => void handleToggleAvailability()}
      />
    </div>
  );
}
