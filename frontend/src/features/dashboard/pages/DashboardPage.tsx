import { Activity, AlertTriangle, BarChart3, Boxes, CheckCircle2, ClipboardList, Clock3, RadioTower, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InfoCard } from "@/components/ui/InfoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCarriers } from "@/features/carriers/hooks/useCarriers";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useBackendStatus } from "@/hooks/useBackendStatus";

export function DashboardPage() {
  const { user } = useAuth();
  const { health, loading, refresh } = useBackendStatus();
  const inventory = useInventory();
  const orders = useOrders();
  const carriers = useCarriers();
  const isBackendUp = health?.status === "UP";

  const metricCards = [
    {
      title: "Inventario",
      value: getInventoryValue(inventory.loading, inventory.error, inventory.summary.totalProducts),
      supportingText: "Productos registrados.",
      icon: Boxes
    },
    {
      title: "Stock disponible",
      value: getInventoryValue(inventory.loading, inventory.error, inventory.summary.availableStock),
      supportingText: "Unidades disponibles.",
      icon: ClipboardList
    },
    {
      title: "Total pedidos",
      value: getOrderValue(orders.loading, orders.error, orders.summary.totalOrders),
      supportingText: "Pedidos registrados.",
      icon: ClipboardList
    },
    {
      title: "Pendientes",
      value: getOrderValue(orders.loading, orders.error, orders.summary.pendingOrders),
      supportingText: "Requieren confirmacion.",
      icon: Clock3
    },
    {
      title: "Confirmados",
      value: getOrderValue(orders.loading, orders.error, orders.summary.confirmedOrders),
      supportingText: "Listos para preparacion.",
      icon: CheckCircle2
    },
    {
      title: "Incidencias",
      value: getOrderValue(orders.loading, orders.error, orders.summary.cancelledOrders),
      supportingText: "Pedidos cancelados.",
      icon: AlertTriangle
    },
    {
      title: "Transportistas activos",
      value: getCarrierValue(carriers.loading, carriers.error, carriers.summary.activeCarriers),
      supportingText: "Proveedores habilitados.",
      icon: Truck
    },
    {
      title: "Pedidos en despacho",
      value: getOrderValue(orders.loading, orders.error, orders.orders.filter((order) => order.status === "SHIPPED").length),
      supportingText: "Pedidos con despacho iniciado.",
      icon: RadioTower
    },
    {
      title: "Envios asignados",
      value: getCarrierValue(carriers.loading, carriers.error, carriers.summary.assignedShipments),
      supportingText: "Despachos con transportista.",
      icon: CheckCircle2
    }
  ];

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
              <RadioTower className="h-4 w-4" aria-hidden="true" />
              {loading ? "Actualizando..." : "Actualizar estado"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metricCards.map((card) => (
          <InfoCard
            key={card.title}
            title={card.title}
            value={card.value}
            supportingText={card.supportingText}
            icon={<card.icon className="h-5 w-5" aria-hidden="true" />}
          />
        ))}
      </section>

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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-brand-700" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-slate-950">Reportes</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">Sin reportes disponibles por el momento.</p>
          </div>

          <InfoCard
            title="Usuario"
            value={user ? user.fullName : "Sin sesion"}
            supportingText={user ? `${user.email} - ${user.role}` : "Acceso no iniciado"}
          />
        </div>
      </section>
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
