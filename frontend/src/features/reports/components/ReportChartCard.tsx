import type { ReactNode } from "react";
import type { ReportChartDatum } from "@/features/reports/types/reportTypes";
import { cn } from "@/utils/cn";

type ReportChartCardProps = {
  title: string;
  description?: string;
  data: ReportChartDatum[];
  footer?: ReactNode;
  emptyMessage?: string;
};

const toneClasses: Record<NonNullable<ReportChartDatum["tone"]>, string> = {
  slate: "bg-slate-500",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500"
};

export function ReportChartCard({ data, description, emptyMessage = "Sin informacion disponible", footer, title }: ReportChartCardProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div>
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>

      <div className="mt-5 space-y-3">
        {data.length === 0 || maxValue === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{emptyMessage}</div>
        ) : (
          data.map((item) => (
            <div key={`${item.label}-${item.helper ?? ""}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800" title={item.label}>
                    {item.label}
                  </p>
                  {item.helper ? <p className="mt-0.5 truncate text-xs text-slate-500">{item.helper}</p> : null}
                </div>
                <span className="shrink-0 font-semibold text-slate-950">{item.value.toLocaleString("es-CL")}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full", toneClasses[item.tone ?? "slate"])}
                  style={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {footer ? <div className="mt-5 border-t border-slate-100 pt-4">{footer}</div> : null}
    </section>
  );
}
