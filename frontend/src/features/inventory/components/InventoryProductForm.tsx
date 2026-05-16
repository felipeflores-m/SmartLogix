import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import type { CreateProductRequest } from "@/features/inventory/types/inventoryTypes";

type ProductFormValues = {
  sku: string;
  name: string;
  description: string;
  unitPrice: string;
};

type ProductFormErrors = Partial<Record<keyof ProductFormValues | "form", string>>;

type InventoryProductFormProps = {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProductRequest) => Promise<void>;
};

const initialValues: ProductFormValues = {
  sku: "",
  name: "",
  description: "",
  unitPrice: ""
};

export function InventoryProductForm({ open, saving, onClose, onSubmit }: InventoryProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        sku: values.sku.trim(),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        unitPrice: Number(values.unitPrice)
      });
      setValues(initialValues);
      setErrors({});
      onClose();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "No se pudo registrar el producto." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 px-4 py-6 backdrop-blur-sm sm:px-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Inventario</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Registrar producto</h3>
          </div>
          <Button type="button" variant="ghost" className="px-3" onClick={onClose} aria-label="Cerrar formulario" disabled={saving}>
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <form className="flex-1 overflow-y-auto p-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-4">
            {errors.form ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{errors.form}</div>
            ) : null}

            <TextInput
              label="SKU"
              name="sku"
              value={values.sku}
              error={errors.sku}
              onChange={(event) => setValues((current) => ({ ...current, sku: event.target.value }))}
              disabled={saving}
            />

            <TextInput
              label="Nombre"
              name="name"
              value={values.name}
              error={errors.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              disabled={saving}
            />

            <label className="block text-sm font-semibold text-slate-800">
              Descripcion
              <textarea
                className="mt-2 block min-h-24 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
                value={values.description}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                disabled={saving}
              />
            </label>

            <TextInput
              label="Precio unitario"
              name="unitPrice"
              type="number"
              min="0"
              step="1"
              value={values.unitPrice}
              error={errors.unitPrice}
              onChange={(event) => setValues((current) => ({ ...current, unitPrice: event.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Registrando..." : "Registrar producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function validate(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const price = Number(values.unitPrice);

  if (!values.sku.trim()) {
    errors.sku = "Ingresa un SKU.";
  }

  if (!values.name.trim()) {
    errors.name = "Ingresa un nombre.";
  }

  if (!values.unitPrice.trim() || !Number.isFinite(price) || price < 0) {
    errors.unitPrice = "Ingresa un precio valido.";
  }

  return errors;
}
