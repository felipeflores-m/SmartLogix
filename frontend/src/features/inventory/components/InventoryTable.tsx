import { Eye, Pencil, Power, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { InventoryItem } from "@/features/inventory/types/inventoryTypes";
import { cn } from "@/utils/cn";

type InventoryTableProps = {
  items: InventoryItem[];
  loading: boolean;
  onViewDetail: (item: InventoryItem) => void;
  onEditProduct: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onDeactivateProduct: (item: InventoryItem) => void;
};

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "short",
  timeStyle: "short"
});

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
});

export function InventoryTable({ items, loading, onViewDetail, onEditProduct, onAdjustStock, onDeactivateProduct }: InventoryTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Productos registrados</h3>
          <p className="mt-1 text-sm text-slate-500">Disponibilidad actual por producto.</p>
        </div>
        <p className="text-sm font-medium text-slate-500">{loading ? "Cargando..." : `${items.length.toLocaleString("es-CL")} productos`}</p>
      </div>

      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[980px] divide-y divide-slate-200 text-left">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
            <tr>
              <TableHeader>SKU</TableHeader>
              <TableHeader>Producto</TableHeader>
              <TableHeader>Bodega</TableHeader>
              <TableHeader align="right">Stock</TableHeader>
              <TableHeader align="right">Precio</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Actualizacion</TableHeader>
              <TableHeader align="right" className="sticky right-0 z-20 bg-slate-50/95 pl-4 shadow-[-14px_0_22px_-22px_rgba(15,23,42,0.65)]">
                Acciones
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <InventoryTableSkeleton />
            ) : (
              items.map((item) => (
                <InventoryTableRow
                  key={item.productId}
                  item={item}
                  onViewDetail={onViewDetail}
                  onEditProduct={onEditProduct}
                  onAdjustStock={onAdjustStock}
                  onDeactivateProduct={onDeactivateProduct}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InventoryTableRow({
  item,
  onViewDetail,
  onEditProduct,
  onAdjustStock,
  onDeactivateProduct
}: {
  item: InventoryItem;
  onViewDetail: (item: InventoryItem) => void;
  onEditProduct: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onDeactivateProduct: (item: InventoryItem) => void;
}) {
  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50/90">
      <TableCell>
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition group-hover:bg-white">
          {item.sku}
        </span>
      </TableCell>
      <TableCell>
        <div className="max-w-[260px]">
          <p className="truncate font-semibold text-slate-950" title={item.name}>
            {item.name}
          </p>
          <p className="mt-1 truncate text-sm text-slate-500" title={item.description?.trim() || "No informado"}>
            {item.description?.trim() || "No informado"}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <WarehouseCell item={item} />
      </TableCell>
      <TableCell align="right">
        <StockCell item={item} />
      </TableCell>
      <TableCell align="right">
        <span className="font-semibold tabular-nums text-slate-900">{currencyFormatter.format(item.unitPrice)}</span>
      </TableCell>
      <TableCell>
        <InventoryStatusBadge status={item.stockStatus} />
      </TableCell>
      <TableCell>
        <span className="whitespace-nowrap text-slate-600">{formatDate(item.updatedAt)}</span>
      </TableCell>
      <TableCell align="right" className="sticky right-0 z-10 bg-white pl-4 shadow-[-14px_0_22px_-22px_rgba(15,23,42,0.55)] transition-colors group-hover:bg-slate-50/95">
        <div className="inline-flex min-w-[178px] justify-end gap-1.5">
          <ActionIconButton label="Ver detalle" onClick={() => onViewDetail(item)}>
            <Eye className="h-4 w-4" aria-hidden="true" />
          </ActionIconButton>
          <ActionIconButton label="Editar producto" onClick={() => onEditProduct(item)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </ActionIconButton>
          <ActionIconButton label="Ajustar stock" onClick={() => onAdjustStock(item)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </ActionIconButton>
          <ActionIconButton label="Desactivar producto" tone="danger" onClick={() => onDeactivateProduct(item)} disabled={!item.active}>
            <Power className="h-4 w-4" aria-hidden="true" />
          </ActionIconButton>
        </div>
      </TableCell>
    </tr>
  );
}

function InventoryTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-5 py-5">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function TableHeader({ children, align = "left", className }: { children: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

function TableCell({ children, align = "left", className }: { children: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <td className={cn("px-4 py-4 align-middle text-sm text-slate-700", align === "right" && "text-right", className)}>
      {children}
    </td>
  );
}

function WarehouseCell({ item }: { item: InventoryItem }) {
  if (item.warehouseStocks.length === 0) {
    return <span className="text-slate-500">Sin bodega asignada</span>;
  }

  const [firstWarehouse] = item.warehouseStocks;

  return (
    <div className="max-w-[150px]">
      <p className="truncate font-semibold text-slate-800" title={firstWarehouse.warehouseName}>
        {firstWarehouse.warehouseName}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">
        {item.warehouseStocks.length === 1 ? firstWarehouse.warehouseCode : `${item.warehouseStocks.length} bodegas`}
      </p>
    </div>
  );
}

function StockCell({ item }: { item: InventoryItem }) {
  return (
    <div className="inline-flex flex-col items-end gap-1">
      <span className="text-base font-semibold tabular-nums text-slate-950">{item.totalQuantity.toLocaleString("es-CL")}</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
        Minimo {item.minimumStock.toLocaleString("es-CL")}
      </span>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No informado";
  }

  return dateFormatter.format(date);
}

function ActionIconButton({
  children,
  disabled,
  label,
  onClick,
  tone = "neutral"
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger";
}) {
  const button = (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        "h-9 min-h-9 w-9 rounded-xl p-0 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-4",
        tone === "danger" && "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-600/15"
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
