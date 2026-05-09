import {
  BarChart3,
  BriefcaseBusiness,
  Factory,
  FileText,
  GitBranch,
  Landmark,
  ReceiptText,
  Ruler,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useFinanceStore } from "../../store/financeStore";
import type { AppSection } from "../../types/finance";

const sections: Array<{
  id: AppSection;
  label: string;
  helper: string;
  icon: typeof BarChart3;
}> = [
  { id: "resumen", label: "Resumen", helper: "Ingresos, gastos y flujo", icon: BarChart3 },
  { id: "gastos", label: "Gastos", helper: "Facturas y compras", icon: ReceiptText },
  { id: "empleados", label: "Empleados", helper: "Pagos y comprobantes", icon: UsersRound },
  { id: "clientes", label: "Clientes", helper: "Pedidos y estados", icon: BriefcaseBusiness },
  { id: "proveedores", label: "Proveedores", helper: "Contactos y listas", icon: Factory },
  { id: "relevamientos", label: "Relevamientos", helper: "Agenda y recordatorios", icon: Ruler },
  { id: "roi", label: "ROI", helper: "Futuras inversiones", icon: Landmark },
  { id: "pipeline", label: "Pipeline", helper: "Drive, Sheets y OCR", icon: GitBranch },
];

export function ModuleShell({ children }: { children: ReactNode }) {
  const activeSection = useFinanceStore((state) => state.activeSection);
  const setActiveSection = useFinanceStore((state) => state.setActiveSection);
  const meta = useFinanceStore((state) => state.spreadsheetMeta());

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-[1.6rem] border border-white/70 bg-white/75 p-3 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.65)] xl:sticky xl:top-6 xl:h-[calc(100dvh-48px)]">
        <div className="border-b border-white/70 p-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-blue-700 text-white">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{meta.title}</p>
              <p className="text-xs text-slate-500">Snapshot {meta.importedAt}</p>
            </div>
          </div>
        </div>

        <nav className="mt-3 grid gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === activeSection;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isActive
                    ? "bg-slate-950 text-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.9)]"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                }`}
              >
                <Icon size={17} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{section.label}</span>
                  <span className={`block text-xs ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {section.helper}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-xs leading-5 text-blue-900">
          Fuente conectada: Google Sheets con {meta.tabs.length} pestanas detectadas.
        </div>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  );
}
