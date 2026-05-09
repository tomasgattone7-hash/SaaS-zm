import { Banknote, CalendarClock, TrendingDown, Users } from "lucide-react";
import { formatCurrency } from "../../lib/formatters";
import { useFinanceStore } from "../../store/financeStore";

export function KpiCards() {
  const total = useFinanceStore((state) => state.expenseTotal());
  const employeeTotal = useFinanceStore((state) => state.employeePaymentTotal());
  const totalOutflow = useFinanceStore((state) => state.financialOutflowTotal());
  const incomeTotal = useFinanceStore((state) => state.incomeTotal());
  const cashBalance = useFinanceStore((state) => state.companyCashBalance());
  const currentPeriod = useFinanceStore((state) => state.currentPeriod);
  const archives = useFinanceStore((state) => state.archives);

  const kpis = [
    {
      label: "Egreso mensual",
      value: formatCurrency(totalOutflow),
      helper: `${formatCurrency(total)} compras + ${formatCurrency(employeeTotal)} sueldos`,
      icon: Banknote,
      tone: "slate",
    },
    {
      label: "Ingreso mensual",
      value: formatCurrency(incomeTotal),
      helper: "Cobros registrados del periodo activo",
      icon: Users,
      tone: "slate",
    },
    {
      label: "Caja acumulada",
      value: formatCurrency(cashBalance),
      helper: "Cierres archivados + periodo activo",
      icon: TrendingDown,
      tone: "rose",
    },
    {
      label: "Periodo activo",
      value: currentPeriod,
      helper: `${archives.length} meses archivados`,
      icon: CalendarClock,
      tone: "blue",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <article
            key={kpi.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.5)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </p>
                <p className="number-font mt-3 text-xl font-semibold tracking-tight text-slate-950">
                  {kpi.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{kpi.helper}</p>
              </div>
              <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
                <Icon size={18} />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
