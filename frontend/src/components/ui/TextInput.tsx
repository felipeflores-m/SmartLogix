import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type TextInputProps = {
  label: string;
  error?: string;
  leadingIcon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ id, label, error, leadingIcon, className, ...props }: TextInputProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative mt-2">
        {leadingIcon ? <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{leadingIcon}</div> : null}
        <input
          id={inputId}
          className={cn(
            "block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15",
            Boolean(leadingIcon) && "pl-10",
            error && "border-danger focus:border-danger focus:ring-red-600/15",
            className
          )}
          {...props}
        />
      </div>
      {error ? <p className="mt-2 text-sm font-medium text-danger">{error}</p> : null}
    </div>
  );
}
