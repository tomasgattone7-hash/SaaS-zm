import { AlertTriangle, Calculator, Factory, Gauge, Landmark, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../lib/formatters";
import {
  buildIndustrialRoiProjection,
  buildOutsourcingProjection,
  PILOT_CUTTING_ARS,
  PILOT_EDGE_BANDING_ARS,
  PILOT_OUTSOURCING_ARS,
  PILOT_TAX_ARS,
} from "../../lib/roi";
import { useFinanceStore } from "../../store/financeStore";

function tooltipCurrency(value: unknown) {
  return formatCurrency(Number(value ?? 0), "USD");
}

function parseNumericInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return Number(normalized) || 0;
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <div className="flex items-center rounded-md border border-slate-300 bg-white px-3 transition focus-within:border-slate-500">
        {prefix && <span className="text-xs font-semibold text-slate-400">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(parseNumericInput(event.target.value))}
          className="number-font min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
        />
        {suffix && <span className="text-xs font-semibold text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

function BreakdownRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "positive" | "negative";
}) {
  const color =
    tone === "positive" ? "text-emerald-700" : tone === "negative" ? "text-rose-700" : "text-slate-950";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`number-font text-sm font-semibold ${color}`}>
        {formatCurrency(value, "USD")}
      </span>
    </div>
  );
}

export function RoiSimulator() {
  const roiInputs = useFinanceStore((state) => state.roiInputs);
  const setRoiInput = useFinanceStore((state) => state.setRoiInput);

  const outsourcing = buildOutsourcingProjection(roiInputs);
  const projection = buildIndustrialRoiProjection(roiInputs);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[390px_1fr]">
        <aside className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-950">
                Payback industrial
              </h2>
              <p className="text-sm text-slate-500">Flujo de caja neto real a 18 meses.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <NumberField
              label="Volumen mensual"
              value={roiInputs.monthlyVolumeRacks}
              suffix="racks"
              onChange={(value) => setRoiInput("monthlyVolumeRacks", value)}
            />
            <NumberField
              label="Tipo de cambio"
              value={roiInputs.exchangeRateArsUsd}
              prefix="ARS"
              suffix="/ USD"
              onChange={(value) => setRoiInput("exchangeRateArsUsd", value)}
            />
            <NumberField
              label="CAPEX puesto en marcha"
              value={roiInputs.capex}
              prefix="USD"
              onChange={(value) => setRoiInput("capex", value)}
            />
            <div className="my-1 border-t border-slate-200" />
            <NumberField
              label="Ingreso bruto mensual"
              value={roiInputs.grossMonthlyRevenueUsd}
              prefix="USD"
              onChange={(value) => setRoiInput("grossMonthlyRevenueUsd", value)}
            />
            <NumberField
              label="COGS insumos directos"
              value={roiInputs.cogsUsd}
              prefix="USD"
              onChange={(value) => setRoiInput("cogsUsd", value)}
            />
            <NumberField
              label="OPEX incremental"
              value={roiInputs.incrementalOpexUsd}
              prefix="USD"
              onChange={(value) => setRoiInput("incrementalOpexUsd", value)}
            />
            <NumberField
              label="Costos fijos asignados"
              value={roiInputs.assignedFixedCostsUsd}
              prefix="USD"
              onChange={(value) => setRoiInput("assignedFixedCostsUsd", value)}
            />
            <NumberField
              label="Retiros y sueldos no reinvertibles"
              value={roiInputs.opportunityCostUsd}
              prefix="USD"
              onChange={(value) => setRoiInput("opportunityCostUsd", value)}
            />
          </div>
        </aside>

        <div className="grid gap-5 p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Gauge size={14} />
                Tercerizado mensual
              </div>
              <p className="number-font mt-2 text-xl font-semibold text-slate-950">
                {formatCurrency(outsourcing.monthlyArs)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Base real: {formatCurrency(PILOT_OUTSOURCING_ARS)} por 7 racks
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Flujo caja neto
              </p>
              <p
                className={`number-font mt-2 text-xl font-semibold ${
                  projection.netCashFlow > 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {formatCurrency(projection.netCashFlow, "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">Despues de insumos, sueldos y retiros</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payback period
              </p>
              <p className="number-font mt-2 text-xl font-semibold text-slate-950">
                {projection.isViable ? `${projection.paybackMonths.toFixed(1)} meses` : "Infinito"}
              </p>
              <p className="mt-1 text-xs text-slate-500">CAPEX / flujo neto mensual</p>
            </div>
            <div
              className={`rounded-lg border p-4 ${
                projection.isViable
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  projection.isViable ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                Viabilidad
              </p>
              <p
                className={`mt-2 text-sm font-semibold ${
                  projection.isViable ? "text-emerald-900" : "text-rose-900"
                }`}
              >
                {projection.isViable
                  ? "Operacion financiable"
                  : "Operacion no viable con la estructura actual"}
              </p>
            </div>
          </div>

          {!projection.isViable && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <p className="text-sm font-medium">
                Operacion no viable con la estructura de retiros y costos actuales. Retorno infinito.
              </p>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Landmark size={17} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-950">Desglose de flujo mensual</h3>
              </div>
              <BreakdownRow
                label="Ingreso bruto mensual"
                value={roiInputs.grossMonthlyRevenueUsd}
                tone="positive"
              />
              <BreakdownRow label="COGS: placas, tapacantos, herrajes" value={-roiInputs.cogsUsd} tone="negative" />
              <BreakdownRow label="Margen bruto" value={projection.grossMargin} tone="positive" />
              <BreakdownRow
                label="OPEX incremental: energia, mantenimiento, software"
                value={-roiInputs.incrementalOpexUsd}
                tone="negative"
              />
              <BreakdownRow
                label="Costos fijos asignados: alquiler, servicios, impuestos"
                value={-roiInputs.assignedFixedCostsUsd}
                tone="negative"
              />
              <BreakdownRow
                label="Flujo operativo"
                value={projection.operatingCashFlow}
                tone={projection.operatingCashFlow > 0 ? "positive" : "negative"}
              />
              <BreakdownRow
                label="Costo oportunidad / retiros / sueldos no reinvertibles"
                value={-roiInputs.opportunityCostUsd}
                tone="negative"
              />
              <BreakdownRow
                label="Flujo de caja neto real"
                value={projection.netCashFlow}
                tone={projection.netCashFlow > 0 ? "positive" : "negative"}
              />
            </div>

            <div className="h-[390px] rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">
                    Recuperacion del CAPEX a 18 meses
                  </h3>
                  <p className="text-sm text-slate-500">
                    Flujo acumulado despues de descontar la inversion inicial.
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 md:flex">
                  <TrendingUp size={14} />
                  Horizonte {roiInputs.projectionMonths} meses
                </div>
              </div>

              <ResponsiveContainer width="100%" height="84%" minWidth={1} minHeight={1}>
                <LineChart data={projection.points} margin={{ top: 12, right: 24, left: 12, bottom: 12 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                  />
                  <Tooltip
                    formatter={tooltipCurrency}
                    labelFormatter={(label) => `Mes ${label}`}
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 12px 30px -18px rgba(15, 23, 42, 0.35)",
                    }}
                  />
                  <ReferenceLine y={0} stroke="#0f172a" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="cumulativeNetCashFlow"
                    name="Flujo neto acumulado"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[auto_1fr]">
            <div className="grid size-10 place-items-center rounded-md bg-white text-slate-700 shadow-sm">
              <Factory size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Tercerizado real: {formatCurrency(PILOT_CUTTING_ARS)} corte +{" "}
                {formatCurrency(PILOT_EDGE_BANDING_ARS)} enchapado + {formatCurrency(PILOT_TAX_ARS)} IVA
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mensual</p>
                  <p className="number-font mt-1 font-semibold text-slate-950">
                    {formatCurrency(outsourcing.monthlyArs)}
                  </p>
                  <p className="text-xs text-slate-500">{formatCurrency(outsourcing.monthlyUsd, "USD")}</p>
                </div>
                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anual</p>
                  <p className="number-font mt-1 font-semibold text-slate-950">
                    {formatCurrency(outsourcing.annualArs)}
                  </p>
                  <p className="text-xs text-slate-500">{formatCurrency(outsourcing.annualUsd, "USD")}</p>
                </div>
                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">5 anos</p>
                  <p className="number-font mt-1 font-semibold text-slate-950">
                    {formatCurrency(outsourcing.fiveYearsArs)}
                  </p>
                  <p className="text-xs text-slate-500">{formatCurrency(outsourcing.fiveYearsUsd, "USD")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
