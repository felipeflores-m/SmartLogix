import {
  BarChart3,
  Boxes,
  Cable,
  ClipboardList,
  Database,
  GitBranch,
  KeyRound,
  MapPinned,
  RadioTower,
  Settings,
  ShieldCheck,
  Truck,
  UsersRound,
  Warehouse
} from "lucide-react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { InventoryPage } from "@/features/inventory/pages/InventoryPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/inventario",
        element: (
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/pedidos",
        element: (
          <ProtectedRoute>
            <PlaceholderPage
              title="Pedidos"
              description="Administra el estado y seguimiento de los pedidos registrados."
              cards={[
                {
                  title: "Pedidos activos",
                  description: "Ordenes creadas, confirmadas y en preparacion.",
                  icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Clientes",
                  description: "Datos basicos del comprador y contacto logistico.",
                  icon: <UsersRound className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Historial de estados",
                  description: "Seguimiento de cambios y avances del pedido.",
                  icon: <GitBranch className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Validaciones",
                  description: "Reglas de negocio antes de confirmar pedidos.",
                  icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                }
              ]}
            />
          </ProtectedRoute>
        )
      },
      {
        path: "/envios",
        element: (
          <ProtectedRoute>
            <PlaceholderPage
              title="Envios"
              description="Administra despachos, estados logisticos y seguimiento de entrega."
              cards={[
                {
                  title: "Despachos activos",
                  description: "Envios pendientes, en transito y entregados.",
                  icon: <Truck className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Asignacion",
                  description: "Seleccion de transportista segun criterios logisticos.",
                  icon: <MapPinned className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Estados",
                  description: "Historial operacional de cada despacho.",
                  icon: <GitBranch className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Coordinacion",
                  description: "Relacion entre pedidos, inventario y despachos.",
                  icon: <Cable className="h-5 w-5" aria-hidden="true" />
                }
              ]}
            />
          </ProtectedRoute>
        )
      },
      {
        path: "/transportistas",
        element: (
          <ProtectedRoute>
            <PlaceholderPage
              title="Transportistas"
              description="Gestiona proveedores logisticos, cobertura y disponibilidad operacional."
              cards={[
                {
                  title: "Proveedores logisticos",
                  description: "Chilexpress, Starken, BlueExpress u otros integradores.",
                  icon: <Truck className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Estado de integracion",
                  description: "Disponibilidad de cada proveedor logistico.",
                  icon: <RadioTower className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Continuidad",
                  description: "Alternativas ante interrupciones de servicio.",
                  icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "SLA y cobertura",
                  description: "Compromisos de entrega por zona y servicio.",
                  icon: <MapPinned className="h-5 w-5" aria-hidden="true" />
                }
              ]}
            />
          </ProtectedRoute>
        )
      },
      {
        path: "/bodegas",
        element: (
          <ProtectedRoute>
            <PlaceholderPage
              title="Bodegas"
              description="Administracion de ubicaciones logisticas, stock distribuido y sincronizacion de inventario."
              cards={[
                {
                  title: "Bodegas activas",
                  description: "Centros disponibles para almacenar y despachar.",
                  icon: <Warehouse className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Stock distribuido",
                  description: "Disponibilidad por ubicacion fisica o logica.",
                  icon: <Boxes className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Sincronizacion",
                  description: "Movimientos consistentes frente a pedidos confirmados.",
                  icon: <GitBranch className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Capacidad",
                  description: "Ocupacion y disponibilidad operacional.",
                  icon: <Database className="h-5 w-5" aria-hidden="true" />
                }
              ]}
            />
          </ProtectedRoute>
        )
      },
      {
        path: "/reportes",
        element: (
          <ProtectedRoute>
            <PlaceholderPage
              title="Reportes"
              description="Revisa indicadores, seguimiento y alertas operacionales."
              cards={[
                {
                  title: "Trazabilidad",
                  description: "Seguimiento desde pedido hasta entrega.",
                  icon: <GitBranch className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Pedidos procesados",
                  description: "Volumen y estados de pedidos registrados.",
                  icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Alertas operacionales",
                  description: "Riesgos por stock, sistema o transportistas.",
                  icon: <RadioTower className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Rendimiento",
                  description: "Disponibilidad general del sistema.",
                  icon: <BarChart3 className="h-5 w-5" aria-hidden="true" />
                }
              ]}
            />
          </ProtectedRoute>
        )
      },
      {
        path: "/configuracion",
        element: (
          <ProtectedRoute>
            <PlaceholderPage
              title="Configuracion"
              description="Administra usuarios, roles y preferencias de operacion."
              cards={[
                {
                  title: "Usuarios y roles",
                  description: "Permisos y perfiles de acceso.",
                  icon: <UsersRound className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Seguridad",
                  description: "Opciones de acceso y proteccion de sesion.",
                  icon: <KeyRound className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Variables de operacion",
                  description: "Preferencias generales del sistema.",
                  icon: <Settings className="h-5 w-5" aria-hidden="true" />
                },
                {
                  title: "Integraciones",
                  description: "Preferencias para proveedores externos.",
                  icon: <Cable className="h-5 w-5" aria-hidden="true" />
                }
              ]}
            />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
