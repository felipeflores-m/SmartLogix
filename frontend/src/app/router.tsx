import {
  Cable,
  KeyRound,
  Settings,
  UsersRound
} from "lucide-react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { CarriersPage } from "@/features/carriers/pages/CarriersPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { InventoryPage } from "@/features/inventory/pages/InventoryPage";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { ReportsPage } from "@/features/reports/pages/ReportsPage";
import { ShipmentsPage } from "@/features/shipments/pages/ShipmentsPage";
import { WarehousesPage } from "@/features/warehouses/pages/WarehousesPage";
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
            <OrdersPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/envios",
        element: (
          <ProtectedRoute>
            <ShipmentsPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/transportistas",
        element: (
          <ProtectedRoute>
            <CarriersPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/bodegas",
        element: (
          <ProtectedRoute>
            <WarehousesPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/reportes",
        element: (
          <ProtectedRoute>
            <ReportsPage />
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
