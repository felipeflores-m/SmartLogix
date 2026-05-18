import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toastContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryDetailPanel } from "@/features/inventory/components/InventoryDetailPanel";
import { InventoryEmptyState } from "@/features/inventory/components/InventoryEmptyState";
import { InventoryErrorState } from "@/features/inventory/components/InventoryErrorState";
import { InventoryFilters } from "@/features/inventory/components/InventoryFilters";
import { InventoryProductEditModal } from "@/features/inventory/components/InventoryProductEditModal";
import { InventoryProductForm } from "@/features/inventory/components/InventoryProductForm";
import { InventoryStockMovementForm } from "@/features/inventory/components/InventoryStockMovementForm";
import { InventorySummaryCards } from "@/features/inventory/components/InventorySummaryCards";
import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import type {
  CreateProductWithInitialStockRequest,
  CreateStockMovementRequest,
  InventoryItem,
  UpdateProductWithMinimumStockRequest
} from "@/features/inventory/types/inventoryTypes";
import { getSafeErrorMessage } from "@/lib/api/apiErrors";

export function InventoryPage() {
  const inventory = useInventory();
  const toast = useToast();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [stockFormItem, setStockFormItem] = useState<InventoryItem | null>(null);
  const [deactivateItem, setDeactivateItem] = useState<InventoryItem | null>(null);
  const detailRequestId = useRef(0);

  async function handleViewDetail(item: InventoryItem) {
    const requestId = detailRequestId.current + 1;
    detailRequestId.current = requestId;
    setDetailItem(item);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const detail = await inventory.getItemDetail(item.productId);
      if (detailRequestId.current === requestId) {
        setDetailItem(detail);
      }
    } catch (error) {
      if (detailRequestId.current === requestId) {
        setDetailError(getSafeErrorMessage(error));
      }
    } finally {
      if (detailRequestId.current === requestId) {
        setDetailLoading(false);
      }
    }
  }

  function handleCloseDetail() {
    detailRequestId.current += 1;
    setDetailItem(null);
    setDetailLoading(false);
    setDetailError(null);
  }

  function handleAdjustFromDetail(item: InventoryItem) {
    setStockFormItem(item);
    handleCloseDetail();
  }

  function handleEditFromDetail(item: InventoryItem) {
    setEditItem(item);
    handleCloseDetail();
  }

  function handleDeactivateFromDetail(item: InventoryItem) {
    setDeactivateItem(item);
    handleCloseDetail();
  }

  async function handleCreateProduct(input: CreateProductWithInitialStockRequest) {
    await inventory.createProduct(input);
    toast.success("Producto registrado correctamente.");
  }

  async function handleUpdateProduct(productId: number, input: UpdateProductWithMinimumStockRequest) {
    await inventory.updateProduct(productId, input);
    toast.success("Producto actualizado correctamente.");
  }

  async function handleCreateStockMovement(input: CreateStockMovementRequest) {
    await inventory.createStockMovement(input);
    toast.success("Movimiento registrado correctamente.");
  }

  async function handleDeactivateProduct() {
    if (!deactivateItem) {
      return;
    }

    try {
      await inventory.deactivateProduct(deactivateItem.productId);
      toast.success("Producto desactivado correctamente.");
      setDeactivateItem(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el producto.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Gestion operacional</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Inventario</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Consulta y administra la disponibilidad de productos registrados.
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" onClick={() => setProductFormOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Registrar producto
              </Button>
            </TooltipTrigger>
            <TooltipContent>Registrar producto</TooltipContent>
          </Tooltip>
        </div>
      </section>

      <InventorySummaryCards summary={inventory.summary} loading={inventory.loading} />

      <InventoryFilters
        filters={inventory.filters}
        items={inventory.items}
        warehouses={inventory.warehouses}
        loading={inventory.loading}
        searching={inventory.searching}
        hasActiveFilters={inventory.hasActiveFilters}
        onChange={inventory.updateFilters}
        onReset={inventory.resetFilters}
        onRefresh={() => void inventory.refresh()}
      />

      {inventory.error ? (
        <InventoryErrorState message={inventory.error} loading={inventory.loading} onRetry={() => void inventory.refresh()} />
      ) : inventory.isEmpty || inventory.hasNoResults ? (
        <InventoryEmptyState hasActiveFilters={inventory.hasActiveFilters} onResetFilters={inventory.resetFilters} />
      ) : (
        <InventoryTable
          items={inventory.filteredItems}
          loading={inventory.loading}
          onViewDetail={(item) => void handleViewDetail(item)}
          onEditProduct={setEditItem}
          onAdjustStock={setStockFormItem}
          onDeactivateProduct={setDeactivateItem}
        />
      )}

      <InventoryProductForm
        open={productFormOpen}
        saving={inventory.saving}
        warehouses={inventory.warehouses}
        existingItems={inventory.items}
        onClose={() => setProductFormOpen(false)}
        onSubmit={handleCreateProduct}
      />
      <InventoryProductEditModal
        item={editItem}
        open={Boolean(editItem)}
        saving={inventory.saving}
        warehouses={inventory.warehouses}
        existingItems={inventory.items}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdateProduct}
      />
      <InventoryDetailPanel
        item={detailItem}
        loading={detailLoading}
        error={detailError}
        onClose={handleCloseDetail}
        onEditProduct={handleEditFromDetail}
        onAdjustStock={handleAdjustFromDetail}
        onDeactivateProduct={handleDeactivateFromDetail}
      />
      <InventoryStockMovementForm
        item={stockFormItem}
        warehouses={inventory.warehouses}
        open={Boolean(stockFormItem)}
        saving={inventory.saving}
        onClose={() => setStockFormItem(null)}
        onSubmit={handleCreateStockMovement}
      />
      <ConfirmDialog
        open={Boolean(deactivateItem)}
        title="Desactivar producto"
        description="El producto dejara de aparecer como activo, pero se conservara su informacion historica."
        confirmLabel="Desactivar producto"
        loading={inventory.saving}
        onClose={() => setDeactivateItem(null)}
        onConfirm={() => void handleDeactivateProduct()}
      />
    </div>
  );
}
