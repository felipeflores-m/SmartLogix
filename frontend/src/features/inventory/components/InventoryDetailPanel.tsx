import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InventoryStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { InventoryItem } from "@/features/inventory/types/inventoryTypes";

type InventoryDetailPanelProps = {
  item: InventoryItem | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
};

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
});

export function InventoryDetailPanel({ item, loading, error, onClose }: InventoryDetailPanelProps) {
  if (!item && !loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 px-4 py-6 backdrop-blur-sm sm:px-6" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Detalle de producto</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">{loading ? "Cargando informacion" : item?.name}</h3>
          </div>
          <Button type="button" variant="ghost" className="px-3" onClick={onClose} aria-label="Cerrar detalle">
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : item ? (
            <div className="space-y-5">
              {error ? <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">{error}</div> : null}

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</p>
                    <p className="mt-1 text-base font-semibold text-slate-950">{item.sku}</p>
                  </div>
                  <InventoryStatusBadge status={item.stockStatus} />
                </div>
                {item.description ? <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p> : null}
              </section>

              <div className="grid gap-3 sm:grid-cols-3">
                <DetailMetric label="Stock total" value={item.totalQuantity.toLocaleString("es-CL")} />
                <DetailMetric label="Stock minimo" value={item.minimumStock.toLocaleString("es-CL")} />
                <DetailMetric label="Precio" value={currencyFormatter.format(item.unitPrice)} />
              </div>

              <section>
                <h4 className="text-sm font-semibold text-slate-950">Disponibilidad por bodega</h4>
                <div className="mt-3 space-y-3">
                  {item.warehouseStocks.length > 0 ? (
                    item.warehouseStocks.map((stock) => (
                      <div key={stock.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-950">{stock.warehouseName}</p>
                            <p className="mt-1 text-sm text-slate-500">{stock.warehouseCode}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-slate-950">{stock.quantity.toLocaleString("es-CL")}</p>
                            <p className="text-xs text-slate-500">Minimo {stock.minimumStock.toLocaleString("es-CL")}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Sin stock registrado.</div>
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
