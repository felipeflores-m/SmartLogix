import { useState } from "react";
import { Plus, RadioTower, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/toastContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCarriers } from "@/features/carriers/hooks/useCarriers";
import { OrderAssignCarrierModal } from "@/features/orders/components/OrderAssignCarrierModal";
import { OrderConfirmDialog } from "@/features/orders/components/OrderConfirmDialog";
import { OrderDetailDrawer } from "@/features/orders/components/OrderDetailDrawer";
import { OrderEmptyState } from "@/features/orders/components/OrderEmptyState";
import { OrderErrorState } from "@/features/orders/components/OrderErrorState";
import { OrderFormModal } from "@/features/orders/components/OrderFormModal";
import { OrdersFilters } from "@/features/orders/components/OrdersFilters";
import { OrdersSummaryCards } from "@/features/orders/components/OrdersSummaryCards";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import { useOrders, type RegisterOrderInput } from "@/features/orders/hooks/useOrders";
import type { Order, OrderStatus } from "@/features/orders/types/orderTypes";
import { useBackendStatus } from "@/hooks/useBackendStatus";

type ConfirmAction =
  | { type: "confirm"; order: Order }
  | { type: "cancel"; order: Order }
  | { type: "status"; order: Order; statuses: OrderStatus[] };

export function OrdersPage() {
  const orders = useOrders();
  const carriers = useCarriers();
  const detail = useOrderDetail(orders.normalizerContext);
  const { health, loading: statusLoading } = useBackendStatus();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const isBackendUp = health?.status === "UP";

  async function handleRegisterOrder(input: RegisterOrderInput) {
    await orders.registerOrder(input);
    toast.success("Pedido registrado correctamente.");
  }

  function handleViewOrder(order: Order) {
    void detail.openOrder(order.id);
  }

  function handleChangeStatus(order: Order) {
    const statuses = orders.getNextStatuses(order);

    if (statuses.length === 0) {
      return;
    }

    if (statuses.length === 1 && statuses[0] === "SHIPPED") {
      setDispatchOrder(order);
      return;
    }

    setConfirmAction({ type: "status", order, statuses });
  }

  async function handleConfirmAction(payload: { status?: OrderStatus; comment?: string }) {
    if (!confirmAction) {
      return;
    }

    try {
      if (confirmAction.type === "confirm") {
        await orders.confirmOrder(confirmAction.order);
        toast.success("Pedido confirmado correctamente.");
      }

      if (confirmAction.type === "cancel") {
        await orders.cancelOrder(confirmAction.order.id);
        toast.success("Pedido cancelado correctamente.");
      }

      if (confirmAction.type === "status" && payload.status) {
        if (payload.status === "SHIPPED") {
          setDispatchOrder(confirmAction.order);
          setConfirmAction(null);
          return;
        }

        await orders.updateOrderStatus(confirmAction.order.id, {
          status: payload.status,
          comment: payload.comment
        });
        toast.success("Estado actualizado correctamente.");
      }

      setConfirmAction(null);
      detail.closeOrder();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar la operacion.");
    }
  }

  async function handleDispatchOrder(input: { carrierCode: string; destinationCity?: string; comment?: string }) {
    if (!dispatchOrder) {
      return;
    }

    try {
      await orders.dispatchOrder(dispatchOrder, input);
      toast.success("Transportista asignado al pedido.");
      setDispatchOrder(null);
      detail.closeOrder();
      void carriers.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible completar la operacion.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Gestion operacional</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Pedidos</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Administra la validacion, estado y seguimiento de los pedidos registrados.
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
                <Button type="button" variant="secondary" onClick={() => void orders.refresh()} disabled={orders.loading}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Actualizar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar pedidos</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" onClick={() => setFormOpen(true)} disabled={orders.loading}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Registrar pedido
                </Button>
              </TooltipTrigger>
              <TooltipContent>Registrar pedido</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>

      <OrdersSummaryCards summary={orders.summary} loading={orders.loading} />

      {orders.referenceError && !orders.error ? (
        <FormMessage tone="info" title="Informacion parcial">
          Algunos datos de apoyo no estan disponibles. Puedes revisar pedidos registrados y actualizar nuevamente.
        </FormMessage>
      ) : null}

      <OrdersFilters
        filters={orders.filters}
        orders={orders.orders}
        customers={orders.customers}
        warehouses={orders.warehouses}
        loading={orders.loading}
        searching={orders.searching}
        hasActiveFilters={orders.hasActiveFilters}
        onChange={orders.updateFilters}
        onReset={orders.resetFilters}
        onRefresh={() => void orders.refresh()}
      />

      {orders.error ? (
        <OrderErrorState message={orders.error} loading={orders.loading} onRetry={() => void orders.refresh()} />
      ) : orders.isEmpty || orders.hasNoResults ? (
        <OrderEmptyState hasActiveFilters={orders.hasActiveFilters} onResetFilters={orders.resetFilters} />
      ) : (
        <OrdersTable
          orders={orders.filteredOrders}
          loading={orders.loading}
          getAvailability={orders.getAvailability}
          getNextStatuses={orders.getNextStatuses}
          onViewDetail={handleViewOrder}
          onConfirm={(order) => setConfirmAction({ type: "confirm", order })}
          onChangeStatus={handleChangeStatus}
          onCancel={(order) => setConfirmAction({ type: "cancel", order })}
        />
      )}

      <OrderFormModal
        open={formOpen}
        saving={orders.saving}
        customers={orders.customers}
        inventoryItems={orders.inventoryItems}
        warehouses={orders.warehouses}
        onClose={() => setFormOpen(false)}
        onSubmit={handleRegisterOrder}
      />

      <OrderDetailDrawer
        order={detail.order}
        loading={detail.loading}
        error={detail.error}
        getAvailability={orders.getAvailability}
        onClose={detail.closeOrder}
      />

      <OrderAssignCarrierModal
        order={dispatchOrder}
        carriers={carriers.carriers}
        loading={orders.saving || carriers.loading}
        onClose={() => setDispatchOrder(null)}
        onConfirm={(input) => void handleDispatchOrder(input)}
      />

      <OrderConfirmDialog
        action={confirmAction}
        loading={orders.saving}
        onClose={() => setConfirmAction(null)}
        onConfirm={(payload) => void handleConfirmAction(payload)}
      />
    </div>
  );
}
