import { Archive, Plus, Trash2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../lib/formatters";
import { useFinanceStore } from "../../store/financeStore";
import type { IncomeRecord } from "../../types/finance";
import { KpiCards } from "./KpiCards";
import { SpendDistributionChart } from "./SpendDistributionChart";

function parseAmount(value: string) {
  return Number(value.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
}

function tooltipCurrency(value: unknown) {
  return formatCurrency(Number(value ?? 0));
}

export function FinancialSummary() {
  const expenses = useFinanceStore((state) => state.expenses);
  const employeePayments = useFinanceStore((state) => state.employeePayments);
  const incomes = useFinanceStore((state) => state.incomes);
  const clients = useFinanceStore((state) => state.clients);
  const currentPeriod = useFinanceStore((state) => state.currentPeriod);
  const archives = useFinanceStore((state) => state.archives);
  const addIncome = useFinanceStore((state) => state.addIncome);
  const deleteIncome = useFinanceStore((state) => state.deleteIncome);
  const closeCurrentMonth = useFinanceStore((state) => state.closeCurrentMonth);
  const netBalance = useFinanceStore((state) => state.netBalance());
  const companyCashBalance = useFinanceStore((state) => state.companyCashBalance());
  const [confirmClose, setConfirmClose] = useState(false);
  const [draft, setDraft] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    cliente: "",
    detalle: "",
    total: "",
    metodo: "TRANSFERENCIA" as IncomeRecord["metodo"],
  });

  const monthlyHistory = useMemo(() => {
    const rows = new Map<string, { mes: string; ingresos: number; gastos: number; empleados: number; neto: number }>();
    const ensure = (date: string) => {
      const mes = date.slice(0, 7);
      if (!rows.has(mes)) rows.set(mes, { mes, ingresos: 0, gastos: 0, empleados: 0, neto: 0 });
      return rows.get(mes)!;
    };

    for (const archive of archives) {
      rows.set(archive.period, {
        mes: archive.period,
        ingresos: archive.totals.income,
        gastos: archive.totals.expenses,
        empleados: archive.totals.employeePayments,
        neto: archive.totals.net,
      });
    }
    for (const income of incomes) ensure(income.fecha).ingresos += income.total;
    for (const expense of expenses) ensure(expense.fecha).gastos += expense.total;
    for (const payment of employeePayments) ensure(payment.fecha).empleados += payment.monto;

    return Array.from(rows.values())
      .map((row) => ({ ...row, neto: row.ingresos - row.gastos - row.empleados }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [archives, employeePayments, expenses, incomes]);

  return (
    <div className="grid gap-6">
      <KpiCards />

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[1.5rem] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.8)]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">Periodo activo</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{currentPeriod}</h2>
              <p className="mt-1 text-sm text-slate-300">
                Al cerrar el mes, movimientos e ingresos se archivan y el periodo nuevo arranca en cero.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
              <p className="text-xs font-semibold text-slate-300">Caja empresa</p>
              <p className="number-font text-xl font-semibold">{formatCurrency(companyCashBalance)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {confirmClose ? (
              <button
                type="button"
                onClick={() => {
                  closeCurrentMonth();
                  setConfirmClose(false);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirmar cierre de mes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClose(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-blue-50"
              >
                <Archive size={15} />
                Cerrar y archivar mes
              </button>
            )}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Archivo mensual</h2>
          <div className="mt-3 max-h-[170px] overflow-auto rounded-2xl bg-slate-50">
            {archives.map((archive) => (
              <details key={archive.id} className="border-b border-white p-3 last:border-0">
                <summary className="cursor-pointer text-sm font-semibold text-slate-950">
                  {archive.period} · Neto {formatCurrency(archive.totals.net)}
                </summary>
                <div className="mt-2 grid gap-1 text-xs text-slate-600 md:grid-cols-2">
                  <span>Ingresos: {formatCurrency(archive.totals.income)}</span>
                  <span>Egresos: {formatCurrency(archive.totals.expenses)}</span>
                  <span>Empleados: {formatCurrency(archive.totals.employeePayments)}</span>
                  <span>Salida total: {formatCurrency(archive.totals.outflow)}</span>
                </div>
              </details>
            ))}
            {!archives.length && (
              <p className="p-4 text-sm text-slate-500">Todavia no hay meses cerrados.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const total = parseAmount(draft.total);
            if (!draft.cliente.trim() || total <= 0) return;
            addIncome({
              fecha: draft.fecha,
              cliente: draft.cliente,
              detalle: draft.detalle,
              total,
              metodo: draft.metodo,
              attachments: [],
            });
            setDraft({
              fecha: new Date().toISOString().slice(0, 10),
              cliente: "",
              detalle: "",
              total: "",
              metodo: "TRANSFERENCIA",
            });
          }}
          className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Ingresos</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Registrar ingreso</h2>
          <p className="mt-1 text-sm text-slate-500">Facturacion, senas, cobros parciales o pagos completos.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="date" value={draft.fecha} onChange={(event) => setDraft((current) => ({ ...current, fecha: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
            <select value={draft.cliente} onChange={(event) => setDraft((current) => ({ ...current, cliente: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white">
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.nombre}>
                  {client.nombre}
                </option>
              ))}
            </select>
            <input value={draft.detalle} onChange={(event) => setDraft((current) => ({ ...current, detalle: event.target.value }))} placeholder="Detalle" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
            <input type="text" inputMode="decimal" value={draft.total} onChange={(event) => setDraft((current) => ({ ...current, total: event.target.value }))} placeholder="Total ARS" className="number-font rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
            <select value={draft.metodo} onChange={(event) => setDraft((current) => ({ ...current, metodo: event.target.value as IncomeRecord["metodo"] }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white">
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="OTRO">OTRO</option>
            </select>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]">
              Agregar ingreso <Plus size={15} />
            </button>
          </div>
        </form>

        <article className="rounded-[1.5rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Resultado</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Flujo neto registrado</h2>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-right ${netBalance >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
              <p className="text-xs font-semibold">Balance</p>
              <p className="number-font text-xl font-semibold">{formatCurrency(netBalance)}</p>
            </div>
          </div>
          <div className="mt-4 max-h-[180px] overflow-auto rounded-2xl bg-slate-50">
            {incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between gap-3 border-b border-white px-3 py-2 text-sm last:border-0">
                <span>
                  <span className="font-medium text-slate-950">{income.cliente}</span>
                  <span className="ml-2 text-slate-500">{income.fecha}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="number-font font-semibold text-emerald-700">{formatCurrency(income.total)}</span>
                  <button type="button" onClick={() => deleteIncome(income.id)} className="rounded-full bg-rose-50 p-1 text-rose-700">
                    <Trash2 size={13} />
                  </button>
                </span>
              </div>
            ))}
            {!incomes.length && <p className="p-4 text-sm text-slate-500">Todavia no hay ingresos cargados.</p>}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[1.5rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-700" />
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Historial mensual</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <AreaChart data={monthlyHistory}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                <Tooltip formatter={tooltipCurrency} />
                <Area type="monotone" dataKey="ingresos" stroke="#059669" fill="#d1fae5" />
                <Area type="monotone" dataKey="gastos" stroke="#dc2626" fill="#fee2e2" />
                <Area type="monotone" dataKey="empleados" stroke="#2563eb" fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Estructura de salida</h2>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={monthlyHistory}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                <Tooltip formatter={tooltipCurrency} />
                <Bar dataKey="gastos" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="empleados" stackId="a" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <SpendDistributionChart />
    </div>
  );
}
