import { DatabaseZap, FileSpreadsheet, ScanLine } from "lucide-react";
import { FinancialSummary } from "./components/dashboard/FinancialSummary";
import {
  ClientsTable,
  EmployeePaymentsTable,
  PipelinePanel,
  ProvidersTable,
  SurveysPanel,
} from "./components/dashboard/ManagementTables";
import { ModuleShell } from "./components/dashboard/ModuleShell";
import { ExpenseTable } from "./components/expenses/ExpenseTable";
import { RoiSimulator } from "./components/roi/RoiSimulator";
import { useFinanceStore } from "./store/financeStore";

export default function App() {
  const activeSection = useFinanceStore((state) => state.activeSection);

  const contentBySection = {
    resumen: <FinancialSummary />,
    gastos: <ExpenseTable />,
    empleados: <EmployeePaymentsTable />,
    clientes: <ClientsTable />,
    proveedores: <ProvidersTable />,
    relevamientos: <SurveysPanel />,
    roi: <RoiSimulator />,
    pipeline: <PipelinePanel />,
  };

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_28%,#eef2ff_62%,#f8fafc_100%)] px-4 py-6 text-slate-950 md:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)] xl:grid xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="pointer-events-none absolute right-8 top-6 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              Aqui Amoblamientos · Melamine Furniture Operations
            </p>
            <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Command Center de operaciones y finanzas
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Consola SaaS para compras, nomina, clientes, relevamientos, proveedores y futuras
              inversiones en una fabrica proveedora de muebles de melamina.
            </p>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:mt-0 xl:w-[560px]">
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <FileSpreadsheet size={14} />
                Sheets API
              </div>
              <p className="mt-1 text-xs text-slate-500">Rama estructurada</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <ScanLine size={14} />
                OCR Vision
              </div>
              <p className="mt-1 text-xs text-slate-500">PDF e imagenes</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <DatabaseZap size={14} />
                JSON unico
              </div>
              <p className="mt-1 text-xs text-slate-500">Normalizado</p>
            </div>
          </div>
        </header>

        <ModuleShell>{contentBySection[activeSection]}</ModuleShell>
      </div>
    </main>
  );
}
