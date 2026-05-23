import { Activity, AlertTriangle, BarChart3, Boxes, CheckCircle2, ClipboardList, Clock3, RadioTower, Truck, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { InfoCard } from "@/components/ui/InfoCard";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/permissions/usePermissions";
import { useCarriers } from "@/features/carriers/hooks/useCarriers";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useBackendStatus } from "@/hooks/useBackendStatus";

export function DashboardPage() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { health, loading, refresh } = useBackendStatus();
  const inventory = useInventory();
  const orders = useOrders();
  const carriers = useCarriers();
  const isBackendUp = health?.status === "UP";
  const dashboardInitialLoading =
    (permissions.canViewPage("inventory") && inventory.initialLoading) ||
    (permissions.canViewPage("orders") && orders.initialLoading) ||
    (permissions.canViewPage("shipments") && carriers.initialLoading) ||
    (permissions.canViewPage("carriers") && carriers.initialLoading) ||
    (permissions.canViewPage("warehouses") && inventory.initialLoading);

  const metricCards = [
    {
      title: "Inventario",
      value: getInventoryValue(inventory.initialLoading, inventory.error, inventory.summary.totalProducts),
      supportingText: "Productos registrados.",
      icon: Boxes,
      visible: permissions.canViewPage("inventory")
    },
    {
      title: "Stock disponible",
      value: getInventoryValue(inventory.initialLoading, inventory.error, inventory.summary.availableStock),
      supportingText: "Unidades disponibles.",
      icon: ClipboardList,
      visible: permissions.canViewPage("inventory")
    },
    {
      title: "Total pedidos",
      value: getOrderValue(orders.initialLoading, orders.error, orders.summary.totalOrders),
      supportingText: "Pedidos registrados.",
      icon: ClipboardList,
      visible: permissions.canViewPage("orders")
    },
    {
      title: "Pendientes",
      value: getOrderValue(orders.initialLoading, orders.error, orders.summary.pendingOrders),
      supportingText: "Requieren confirmacion.",
      icon: Clock3,
      visible: permissions.canViewPage("orders")
    },
    {
      title: "Confirmados",
      value: getOrderValue(orders.initialLoading, orders.error, orders.summary.confirmedOrders),
      supportingText: "Listos para preparacion.",
      icon: CheckCircle2,
      visible: permissions.canViewPage("orders")
    },
    {
      title: "Incidencias",
      value: getOrderValue(orders.initialLoading, orders.error, orders.summary.cancelledOrders),
      supportingText: "Pedidos cancelados.",
      icon: AlertTriangle,
      visible: permissions.canViewPage("orders")
    },
    {
      title: "Transportistas activos",
      value: getCarrierValue(carriers.initialLoading, carriers.error, carriers.summary.activeCarriers),
      supportingText: "Proveedores habilitados.",
      icon: Truck,
      visible: permissions.canViewPage("carriers")
    },
    {
      title: "Bodegas activas",
      value: getInventoryValue(inventory.initialLoading, inventory.error, inventory.warehouses.filter((warehouse) => warehouse.active).length),
      supportingText: "Ubicaciones operativas.",
      icon: Warehouse,
      visible: permissions.canViewPage("warehouses")
    },
    {
      title: "Pedidos en despacho",
      value: getOrderValue(orders.initialLoading, orders.error, orders.orders.filter((order) => order.status === "SHIPPED").length),
      supportingText: "Pedidos con despacho iniciado.",
      icon: RadioTower,
      visible: permissions.canViewPage("orders") && permissions.canViewPage("shipments")
    },
    {
      title: "Envios asignados",
      value: getCarrierValue(carriers.initialLoading, carriers.error, carriers.summary.assignedShipments),
      supportingText: "Despachos con transportista.",
      icon: CheckCircle2,
      visible: permissions.canViewPage("shipments")
    }
  ].filter((card) => card.visible);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_300px] lg:p-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Panel operacional</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Estado general de la operacion
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Revisa el estado actual de inventario, pedidos, envios y alertas operacionales.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Sistema</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {loading ? "Verificando" : isBackendUp ? "Operativo" : "Sin conexion"}
                </p>
              </div>
              <StatusBadge
                label={loading ? "Verificando" : isBackendUp ? "Sistema operativo" : "Sin conexion"}
                tone={loading ? "neutral" : isBackendUp ? "success" : "danger"}
              />
            </div>
            <Button type="button" variant="secondary" className="mt-5 w-full" onClick={() => void refresh()} disabled={loading}>
              {loading ? <Spinner size="sm" label="Actualizando estado" /> : <RadioTower className="h-4 w-4" aria-hidden="true" />}
              {loading ? "Actualizando..." : "Actualizar estado"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metricCards.length > 0 && dashboardInitialLoading ? (
          <div className="sm:col-span-2 xl:col-span-3 2xl:col-span-6">
            <CardSkeleton count={metricCards.length} columns={4} />
          </div>
        ) : metricCards.length > 0 ? (
          metricCards.map((card) => (
            <InfoCard
              key={card.title}
              title={card.title}
              value={card.value}
              supportingText={card.supportingText}
              icon={<card.icon className="h-5 w-5" aria-hidden="true" />}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600 shadow-panel sm:col-span-2 xl:col-span-3 2xl:col-span-6">
            No hay módulos disponibles para tu perfil.
          </div>
        )}
      </section>

      {dashboardInitialLoading ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <SectionSkeleton lines={3} actions={1} />
          <SectionSkeleton lines={2} />
        </section>
      ) : (
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Actividad reciente</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">Seguimiento operativo</h3>
            </div>
            <Activity className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            No hay actividad reciente.
          </div>
        </div>

        <div className="space-y-5">
          {permissions.canViewReports() ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-brand-700" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-slate-950">Reportes</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">Indicadores operacionales disponibles desde el modulo Reportes.</p>
            </div>
          ) : null}

          <InfoCard
            title="Usuario"
            value={user ? user.fullName : "Sin sesion"}
            supportingText={user ? `${user.email} - ${user.role}` : "Acceso no iniciado"}
          />
        </div>
      </section>
      )}
    </div>
  );
}

function getInventoryValue(loading: boolean, error: string | null, value: number): string {
  if (loading) {
    return "...";
  }

  if (error) {
    return "Sin datos";
  }

  if (value === 0) {
    return "Sin registros";
  }

  return value.toLocaleString("es-CL");
}

function getOrderValue(loading: boolean, error: string | null, value: number): string {
  if (loading) {
    return "...";
  }

  if (error) {
    return "Sin datos";
  }

  if (value === 0) {
    return "Sin registros";
  }

  return value.toLocaleString("es-CL");
}

function getCarrierValue(loading: boolean, error: string | null, value: number): string {
  if (loading) {
    return "...";
  }

  if (error) {
    return "Sin datos";
  }

  if (value === 0) {
    return "Sin registros";
  }

  return value.toLocaleString("es-CL");
}
