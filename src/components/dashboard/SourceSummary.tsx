import { CheckCircle2, Cloud, FileSpreadsheet, ScanLine } from "lucide-react";
import { useFinanceStore } from "../../store/financeStore";

export function SourceSummary() {
  const expenses = useFinanceStore((state) => state.expenses);
  const employeePayments = useFinanceStore((state) => state.employeePayments);
  const clients = useFinanceStore((state) => state.clients);
  const providers = useFinanceStore((state) => state.providers);
  const lowConfidence = useFinanceStore((state) => state.lowConfidenceCount());

  const sourceCounts = {
    sheet: expenses.filter((expense) => expense.origen_dato === "sheet").length,
    pdf: expenses.filter((expense) => expense.origen_dato === "pdf").length,
    image: expenses.filter((expense) => expense.origen_dato === "image").length,
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
            <Cloud size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-950">
              Estado financiero consolidado
            </h2>
            <p className="text-sm text-slate-500">
              Finanzas abril combina egresos operativos y pagos realizados.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            ["Egresos y facturas", `${expenses.length} registros`],
            ["Pagos empleados", `${employeePayments.length} pagos`],
            ["Clientes", `${clients.length} registros`],
            ["Proveedores", `${providers.length} registros`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-600">{label}</span>
              <span className="number-font text-sm font-semibold text-slate-950">{value}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">
            Pipeline hibrido
          </h2>
          <p className="text-sm text-slate-500">
            Clasificacion de origen y trazabilidad de comprobantes.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <FileSpreadsheet className="text-slate-700" size={20} />
            <p className="number-font mt-3 text-2xl font-semibold">{sourceCounts.sheet}</p>
            <p className="text-sm text-slate-500">Sheets</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <FileSpreadsheet className="text-blue-700" size={20} />
            <p className="number-font mt-3 text-2xl font-semibold">{sourceCounts.pdf}</p>
            <p className="text-sm text-slate-500">PDF</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <ScanLine className="text-emerald-700" size={20} />
            <p className="number-font mt-3 text-2xl font-semibold">{sourceCounts.image}</p>
            <p className="text-sm text-slate-500">Imagenes OCR</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <CheckCircle2 className="text-amber-700" size={20} />
            <p className="number-font mt-3 text-2xl font-semibold">{lowConfidence}</p>
            <p className="text-sm text-amber-700">Revisar OCR</p>
          </div>
        </div>
      </article>
    </section>
  );
}
