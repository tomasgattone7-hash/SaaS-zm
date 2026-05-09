import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { formatCurrency } from "../../lib/formatters";
import { useFinanceStore } from "../../store/financeStore";

const colors = ["#0f172a", "#2563eb", "#059669", "#c2410c", "#be123c", "#7c3aed", "#64748b"];

function tooltipCurrency(value: unknown) {
  return formatCurrency(Number(value ?? 0));
}

export function SpendDistributionChart() {
  const expenses = useFinanceStore((state) => state.expenses);
  const sorted = useMemo(() => {
    const totals = new Map<string, number>();

    for (const expense of expenses) {
      totals.set(
        expense.categoria_sugerida,
        (totals.get(expense.categoria_sugerida) ?? 0) + expense.total,
      );
    }

    return Array.from(totals.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-950">
              Distribucion por categoria
            </h2>
            <p className="text-sm text-slate-500">Lectura rapida del peso real de cada rubro.</p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={sorted} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="categoria" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              />
              <Tooltip
                formatter={tooltipCurrency}
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 12px 30px -18px rgba(15, 23, 42, 0.35)",
                }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {sorted.map((entry, index) => (
                  <Cell key={entry.categoria} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Mix de gastos</h2>
          <p className="text-sm text-slate-500">Participacion relativa del gasto historico.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-1 xl:grid-cols-[180px_1fr]">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={sorted}
                  dataKey="total"
                  nameKey="categoria"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {sorted.map((entry, index) => (
                    <Cell key={entry.categoria} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipCurrency} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid content-center gap-2">
            {sorted.map((item, index) => (
              <div key={item.categoria} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-600">
                  <span
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="truncate">{item.categoria}</span>
                </span>
                <span className="number-font font-medium text-slate-950">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
