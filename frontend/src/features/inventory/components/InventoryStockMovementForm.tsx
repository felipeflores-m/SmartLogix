import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import type {
  CreateStockMovementRequest,
  InventoryItem,
  StockMovementType,
  WarehouseResponse
} from "@/features/inventory/types/inventoryTypes";

type StockMovementFormValues = {
  warehouseId: string;
  type: StockMovementType;
  quantity: string;
  reason: string;
};

type StockMovementFormErrors = Partial<Record<keyof StockMovementFormValues | "form", string>>;

type InventoryStockMovementFormProps = {
  item: InventoryItem | null;
  warehouses: WarehouseResponse[];
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: CreateStockMovementRequest) => Promise<void>;
};

const movementTypes: Array<{ value: StockMovementType; label: string }> = [
  { value: "IN", label: "Entrada" },
  { value: "OUT", label: "Salida" },
  { value: "ADJUSTMENT", label: "Ajuste" }
];

export function InventoryStockMovementForm({ item, warehouses, open, saving, onClose, onSubmit }: InventoryStockMovementFormProps) {
  const defaultWarehouseId = useMemo(() => {
    if (item?.warehouseStocks[0]) {
      return String(item.warehouseStocks[0].warehouseId);
    }

    if (warehouses[0]) {
      return String(warehouses[0].id);
    }

    return "";
  }, [item, warehouses]);
  const [values, setValues] = useState<StockMovementFormValues>({
    warehouseId: defaultWarehouseId,
    type: "IN",
    quantity: "",
    reason: ""
  });
  const [errors, setErrors] = useState<StockMovementFormErrors>({});

  if (!open || !item) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const effectiveValues = { ...values, warehouseId: values.warehouseId || defaultWarehouseId };
    const nextErrors = validate(effectiveValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !item) {
      return;
    }

    try {
      await onSubmit({
        productId: item.productId,
        warehouseId: Number(effectiveValues.warehouseId),
        type: effectiveValues.type,
        quantity: Number(effectiveValues.quantity),
        reason: effectiveValues.reason.trim() || undefined
      });
      setValues({ warehouseId: defaultWarehouseId, type: "IN", quantity: "", reason: "" });
      setErrors({});
      onClose();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "No se pudo registrar el movimiento." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 px-4 py-6 backdrop-blur-sm sm:px-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Inventario</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Ajustar stock</h3>
            <p className="mt-1 text-sm text-slate-500">{item.name}</p>
          </div>
          <Button type="button" variant="ghost" className="px-3" onClick={onClose} aria-label="Cerrar ajuste" disabled={saving}>
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <form className="flex-1 overflow-y-auto p-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-4">
            {errors.form ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{errors.form}</div>
            ) : null}

            <label className="block text-sm font-semibold text-slate-800">
              Bodega
              <select
                className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
                value={values.warehouseId || defaultWarehouseId}
                onChange={(event) => setValues((current) => ({ ...current, warehouseId: event.target.value }))}
                disabled={saving || warehouses.length === 0}
              >
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={String(warehouse.id)}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-800">
              Tipo
              <select
                className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
                value={values.type}
                onChange={(event) => setValues((current) => ({ ...current, type: event.target.value as StockMovementType }))}
                disabled={saving}
              >
                {movementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <TextInput
              label="Cantidad"
              name="quantity"
              type="number"
              min="1"
              step="1"
              value={values.quantity}
              error={errors.quantity}
              onChange={(event) => setValues((current) => ({ ...current, quantity: event.target.value }))}
              disabled={saving}
            />

            <label className="block text-sm font-semibold text-slate-800">
              Motivo
              <textarea
                className="mt-2 block min-h-24 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
                value={values.reason}
                onChange={(event) => setValues((current) => ({ ...current, reason: event.target.value }))}
                disabled={saving}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || warehouses.length === 0}>
              {saving ? "Registrando..." : "Registrar movimiento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function validate(values: StockMovementFormValues): StockMovementFormErrors {
  const errors: StockMovementFormErrors = {};
  const quantity = Number(values.quantity);

  if (!values.warehouseId) {
    errors.warehouseId = "Selecciona una bodega.";
  }

  if (!values.quantity.trim() || !Number.isInteger(quantity) || quantity <= 0) {
    errors.quantity = "Ingresa una cantidad valida.";
  }

  return errors;
}
