import { RotateCcw } from "lucide-react";
import { useFinanceStore } from "../../store/financeStore";
import type { ExpenseCategory, ExpenseOrigin } from "../../types/finance";

const categories: Array<"Todas" | ExpenseCategory> = [
  "Todas",
  "Corte",
  "Enchapado",
  "Herrajes",
  "Melamina",
  "Produccion Melamina",
  "Flete",
  "Servicios",
  "Otros",
];

const origins: Array<"Todos" | ExpenseOrigin> = ["Todos", "sheet", "pdf", "image", "manual"];

export function ExpenseFilters() {
  const filters = useFinanceStore((state) => state.filters);
  const setFilter = useFinanceStore((state) => state.setFilter);
  const clearFilters = useFinanceStore((state) => state.clearFilters);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Filtros globales</h2>
          <p className="text-sm text-slate-500">Audita por fecha, proveedor, categoria y origen.</p>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw size={15} />
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Desde
          <input
            type="date"
            value={filters.from}
            onChange={(event) => setFilter("from", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Hasta
          <input
            type="date"
            value={filters.to}
            onChange={(event) => setFilter("to", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Proveedor
          <input
            value={filters.proveedor}
            onChange={(event) => setFilter("proveedor", event.target.value)}
            placeholder="Buscar proveedor"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Categoria
          <select
            value={filters.categoria}
            onChange={(event) =>
              setFilter("categoria", event.target.value as "Todas" | ExpenseCategory)
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Origen
          <select
            value={filters.origen}
            onChange={(event) => setFilter("origen", event.target.value as "Todos" | ExpenseOrigin)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          >
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
