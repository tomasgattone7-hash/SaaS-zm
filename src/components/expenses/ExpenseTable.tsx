import { AlertTriangle, ExternalLink, FileSearch, Paperclip, Plus, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../lib/formatters";
import { useFinanceStore } from "../../store/financeStore";
import type { AttachmentRecord, ExpenseCategory, ExpenseOrigin } from "../../types/finance";
import { ExpenseFilters } from "./ExpenseFilters";

const categories: ExpenseCategory[] = [
  "Corte",
  "Enchapado",
  "Herrajes",
  "Melamina",
  "Produccion Melamina",
  "Flete",
  "Servicios",
  "Otros",
];

const origins: ExpenseOrigin[] = ["sheet", "pdf", "image", "manual"];

function parseAmount(value: string) {
  return Number(value.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
}

function makeAttachment(file: File): AttachmentRecord {
  return {
    id: `attachment-${Date.now()}-${file.name}`,
    name: file.name,
    type: file.type || "application/octet-stream",
    url: URL.createObjectURL(file),
    createdAt: new Date().toISOString(),
  };
}

export function ExpenseTable() {
  const allExpenses = useFinanceStore((state) => state.expenses);
  const filters = useFinanceStore((state) => state.filters);
  const updateExpense = useFinanceStore((state) => state.updateExpense);
  const addExpense = useFinanceStore((state) => state.addExpense);
  const deleteExpense = useFinanceStore((state) => state.deleteExpense);
  const addAttachment = useFinanceStore((state) => state.addExpenseAttachment);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    proveedor: "",
    detalle: "",
    total: "",
    categoria_sugerida: "Produccion Melamina" as ExpenseCategory,
    archivo_nombre: "",
  });

  const expenses = useMemo(
    () =>
      allExpenses.filter((expense) => {
        const matchesFrom = !filters.from || expense.fecha >= filters.from;
        const matchesTo = !filters.to || expense.fecha <= filters.to;
        const matchesProveedor =
          !filters.proveedor ||
          expense.proveedor.toLowerCase().includes(filters.proveedor.toLowerCase());
        const matchesCategoria =
          filters.categoria === "Todas" || expense.categoria_sugerida === filters.categoria;
        const matchesOrigen = filters.origen === "Todos" || expense.origen_dato === filters.origen;

        return matchesFrom && matchesTo && matchesProveedor && matchesCategoria && matchesOrigen;
      }),
    [allExpenses, filters],
  );

  return (
    <section className="grid gap-5">
      <ExpenseFilters />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const total = parseAmount(draft.total);
          if (!draft.proveedor.trim() || !Number.isFinite(total) || total <= 0) return;

          addExpense({
            fecha: draft.fecha,
            proveedor: draft.proveedor.trim(),
            detalle: draft.detalle.trim() || draft.proveedor.trim(),
            total,
            categoria_sugerida: draft.categoria_sugerida,
            origen_dato: "manual",
            tipo_movimiento: "egreso",
            archivo_nombre: draft.archivo_nombre.trim() || "Carga manual",
            editable: true,
            attachments: [],
          });

          setDraft({
            fecha: new Date().toISOString().slice(0, 10),
            proveedor: "",
            detalle: "",
            total: "",
            categoria_sugerida: "Produccion Melamina",
            archivo_nombre: "",
          });
        }}
        className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Compras</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Agregar factura o gasto</h2>
            <p className="text-sm text-slate-500">
              Registra compras de melamina, herrajes, servicios o comprobantes pendientes de OCR.
            </p>
          </div>
          <button
            type="submit"
            className="group inline-flex w-max items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-700 active:scale-[0.98]"
          >
            Agregar factura
            <span className="grid size-7 place-items-center rounded-full bg-white/10 transition group-hover:translate-x-0.5">
              <Plus size={15} />
            </span>
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[150px_1fr_1fr_150px_190px_1fr]">
          <input type="date" value={draft.fecha} onChange={(event) => setDraft((current) => ({ ...current, fecha: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.proveedor} onChange={(event) => setDraft((current) => ({ ...current, proveedor: event.target.value }))} placeholder="Proveedor" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.detalle} onChange={(event) => setDraft((current) => ({ ...current, detalle: event.target.value }))} placeholder="Detalle" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input type="text" inputMode="decimal" value={draft.total} onChange={(event) => setDraft((current) => ({ ...current, total: event.target.value }))} placeholder="Total ARS" className="number-font rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <select value={draft.categoria_sugerida} onChange={(event) => setDraft((current) => ({ ...current, categoria_sugerida: event.target.value as ExpenseCategory }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input value={draft.archivo_nombre} onChange={(event) => setDraft((current) => ({ ...current, archivo_nombre: event.target.value }))} placeholder="Archivo o nota" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
        </div>
      </form>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Historial de gastos</h2>
            <p className="text-sm text-slate-500">Edita celdas, adjunta facturas y conserva trazabilidad.</p>
          </div>
          <span className="w-max rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {expenses.length} registros filtrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1220px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-4 py-3 font-semibold">Detalle</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Origen</th>
                <th className="px-4 py-3 font-semibold">Adjuntos</th>
                <th className="px-4 py-3 font-semibold">OCR</th>
                <th className="px-4 py-3 font-semibold">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="transition hover:bg-blue-50/35">
                  <td className="px-4 py-3"><input type="date" value={expense.fecha} onChange={(event) => updateExpense(expense.id, "fecha", event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={expense.proveedor} onChange={(event) => updateExpense(expense.id, "proveedor", event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={expense.detalle ?? ""} onChange={(event) => updateExpense(expense.id, "detalle", event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3">
                    <input type="text" inputMode="decimal" value={expense.total} onChange={(event) => updateExpense(expense.id, "total", parseAmount(event.target.value))} className="number-font w-32 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" />
                    <div className="mt-1 text-xs text-slate-400">{formatCurrency(expense.total)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={expense.categoria_sugerida} onChange={(event) => updateExpense(expense.id, "categoria_sugerida", event.target.value as ExpenseCategory)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none focus:border-blue-400">
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={expense.origen_dato} onChange={(event) => updateExpense(expense.id, "origen_dato", event.target.value as ExpenseOrigin)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none focus:border-blue-400">
                      {origins.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-blue-100 hover:text-blue-700">
                        <Upload size={13} />
                        Subir
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) addAttachment(expense.id, makeAttachment(file));
                          event.currentTarget.value = "";
                        }} />
                      </label>
                      {(expense.attachments ?? []).map((attachment) => (
                        <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          <Paperclip size={12} />
                          {attachment.name.slice(0, 18)}
                          <ExternalLink size={11} />
                        </a>
                      ))}
                      {!expense.attachments?.length && <span className="text-xs text-slate-400">{expense.archivo_nombre ?? "-"}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {typeof expense.confianza_ocr === "number" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        {expense.confianza_ocr < 0.85 && <AlertTriangle size={13} />}
                        {Math.round(expense.confianza_ocr * 100)}%
                      </span>
                    ) : <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Directo</span>}
                  </td>
                  <td className="px-4 py-3">
                    {pendingDelete === expense.id ? (
                      <button type="button" onClick={() => { deleteExpense(expense.id); setPendingDelete(null); }} className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">
                        Confirmar borrar
                      </button>
                    ) : (
                      <button type="button" onClick={() => setPendingDelete(expense.id)} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                        <Trash2 size={13} />
                        Borrar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="grid place-items-center px-5 py-14 text-center">
            <div className="grid max-w-sm gap-2">
              <FileSearch className="mx-auto text-slate-400" size={34} />
              <p className="text-sm font-medium text-slate-700">No hay facturas para estos filtros.</p>
              <p className="text-sm text-slate-500">Ajusta el rango de fechas o limpia proveedor, categoria y origen.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
