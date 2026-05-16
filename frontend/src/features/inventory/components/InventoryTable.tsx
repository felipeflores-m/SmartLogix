import { Eye, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { InventoryStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { InventoryItem } from "@/features/inventory/types/inventoryTypes";

type InventoryTableProps = {
  items: InventoryItem[];
  loading: boolean;
  onViewDetail: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
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

export function InventoryTable({ items, loading, onViewDetail, onAdjustStock }: InventoryTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-950">Productos registrados</h3>
        <p className="mt-1 text-sm text-slate-500">Disponibilidad actual por producto.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <TableHeader>SKU</TableHeader>
              <TableHeader>Producto</TableHeader>
              <TableHeader>Bodega</TableHeader>
              <TableHeader>Stock</TableHeader>
              <TableHeader>Precio</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Ultima actualizacion</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <InventoryTableSkeleton />
            ) : (
              items.map((item) => (
                <InventoryTableRow key={item.productId} item={item} onViewDetail={onViewDetail} onAdjustStock={onAdjustStock} />
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
  onAdjustStock
}: {
  item: InventoryItem;
  onViewDetail: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
}) {
  return (
    <tr className="transition hover:bg-slate-50">
      <TableCell>
        <span className="font-semibold text-slate-900">{item.sku}</span>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-semibold text-slate-950">{item.name}</p>
          {item.description ? <p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.description}</p> : null}
        </div>
      </TableCell>
      <TableCell>{getWarehouseLabel(item)}</TableCell>
      <TableCell>
        <div className="font-semibold text-slate-950">{item.totalQuantity.toLocaleString("es-CL")}</div>
        <p className="mt-1 text-xs text-slate-500">Minimo {item.minimumStock.toLocaleString("es-CL")}</p>
      </TableCell>
      <TableCell>{currencyFormatter.format(item.unitPrice)}</TableCell>
      <TableCell>
        <InventoryStatusBadge status={item.stockStatus} />
      </TableCell>
      <TableCell>{formatDate(item.updatedAt)}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="min-h-9 px-3" onClick={() => onViewDetail(item)}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Ver detalle
          </Button>
          <Button type="button" variant="ghost" className="min-h-9 px-3" onClick={() => onAdjustStock(item)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Ajustar
          </Button>
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
            <td key={cellIndex} className="px-5 py-4">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function TableHeader({ children }: { children: string }) {
  return <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</th>;
}

function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-5 py-4 align-middle text-sm text-slate-700">{children}</td>;
}

function getWarehouseLabel(item: InventoryItem): string {
  if (item.warehouseStocks.length === 0) {
    return "Sin bodega asignada";
  }

  if (item.warehouseStocks.length === 1) {
    return item.warehouseStocks[0].warehouseName;
  }

  return `${item.warehouseStocks.length} bodegas`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin informacion";
  }

  return dateFormatter.format(date);
}
