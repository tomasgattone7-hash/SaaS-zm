import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  ExternalLink,
  Factory,
  Paperclip,
  Plus,
  ReceiptText,
  Trash2,
  Upload,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../lib/formatters";
import { useFinanceStore } from "../../store/financeStore";
import type {
  AttachmentRecord,
  ClientRecord,
  EmployeePaymentRecord,
  SurveyRecord,
} from "../../types/finance";

type IconType = typeof UsersRound;

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

function PanelHeader({ title, helper, icon: Icon }: { title: string; helper: string; icon: IconType }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/60 px-5 py-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-blue-700 text-white shadow-[0_12px_28px_-18px_rgba(37,99,235,0.9)]">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{helper}</p>
      </div>
    </div>
  );
}

function ConfirmDeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);

  return armed ? (
    <button
      type="button"
      onClick={onConfirm}
      className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
    >
      Confirmar borrar
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setArmed(true)}
      className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
    >
      <Trash2 size={13} />
      Borrar
    </button>
  );
}

export function EmployeePaymentsTable() {
  const payments = useFinanceStore((state) => state.employeePayments);
  const update = useFinanceStore((state) => state.updateEmployeePayment);
  const addPayment = useFinanceStore((state) => state.addEmployeePayment);
  const deletePayment = useFinanceStore((state) => state.deleteEmployeePayment);
  const addAttachment = useFinanceStore((state) => state.addEmployeePaymentAttachment);
  const total = useFinanceStore((state) => state.employeePaymentTotal());
  const [draft, setDraft] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    empleado: "",
    monto: "",
    forma_pago: "TRANSFERENCIA" as EmployeePaymentRecord["forma_pago"],
    comprobante: "",
  });

  return (
    <section className="grid gap-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const monto = parseAmount(draft.monto);
          if (!draft.empleado.trim() || monto <= 0) return;
          addPayment({
            fecha: draft.fecha,
            empleado: draft.empleado.trim().toUpperCase(),
            monto,
            forma_pago: draft.forma_pago,
            comprobante: draft.comprobante.trim() || draft.forma_pago,
            attachments: [],
          });
          setDraft({
            fecha: new Date().toISOString().slice(0, 10),
            empleado: "",
            monto: "",
            forma_pago: "TRANSFERENCIA",
            comprobante: "",
          });
        }}
        className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Nomina</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Registrar pago realizado</h2>
            <p className="text-sm text-slate-500">Adjunta transferencias, recibos o constancias de efectivo.</p>
          </div>
          <button className="inline-flex w-max items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]">
            Agregar pago <Plus size={16} />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[150px_1fr_150px_190px_1fr]">
          <input type="date" value={draft.fecha} onChange={(event) => setDraft((current) => ({ ...current, fecha: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.empleado} onChange={(event) => setDraft((current) => ({ ...current, empleado: event.target.value }))} placeholder="Empleado" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input type="text" inputMode="decimal" value={draft.monto} onChange={(event) => setDraft((current) => ({ ...current, monto: event.target.value }))} placeholder="Monto ARS" className="number-font rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <select value={draft.forma_pago} onChange={(event) => setDraft((current) => ({ ...current, forma_pago: event.target.value as EmployeePaymentRecord["forma_pago"] }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white">
            <option value="TRANSFERENCIA">TRANSFERENCIA</option>
            <option value="EFECTIVO">EFECTIVO</option>
            <option value="OTRO">OTRO</option>
          </select>
          <input value={draft.comprobante} onChange={(event) => setDraft((current) => ({ ...current, comprobante: event.target.value }))} placeholder="Comprobante o nota" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
        </div>
      </form>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
        <PanelHeader title="Pagos empleados" helper={`${payments.length} pagos. Total abonado: ${formatCurrency(total)}`} icon={UsersRound} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Forma</th>
                <th className="px-4 py-3">Adjuntos</th>
                <th className="px-4 py-3">Borrar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-blue-50/35">
                  <td className="px-4 py-3"><input type="date" value={payment.fecha} onChange={(event) => update(payment.id, "fecha", event.target.value)} className="rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={payment.empleado} onChange={(event) => update(payment.id, "empleado", event.target.value)} className="rounded-lg border border-transparent bg-transparent px-2 py-1 font-medium outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input type="text" inputMode="decimal" value={payment.monto} onChange={(event) => update(payment.id, "monto", parseAmount(event.target.value))} className="number-font w-32 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3">
                    <select value={payment.forma_pago} onChange={(event) => update(payment.id, "forma_pago", event.target.value as EmployeePaymentRecord["forma_pago"])} className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none focus:border-blue-400">
                      <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-blue-100 hover:text-blue-700">
                        <Upload size={13} /> Subir
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) addAttachment(payment.id, makeAttachment(file));
                          event.currentTarget.value = "";
                        }} />
                      </label>
                      {(payment.attachments ?? []).map((attachment) => (
                        <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          <Paperclip size={12} /> {attachment.name.slice(0, 16)} <ExternalLink size={11} />
                        </a>
                      ))}
                      {!payment.attachments?.length && <span className="text-xs text-slate-400">{payment.comprobante}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><ConfirmDeleteButton onConfirm={() => deletePayment(payment.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ClientsTable() {
  const clients = useFinanceStore((state) => state.clients);
  const update = useFinanceStore((state) => state.updateClient);
  const addClient = useFinanceStore((state) => state.addClient);
  const deleteClient = useFinanceStore((state) => state.deleteClient);
  const [draft, setDraft] = useState({
    nombre: "",
    contacto: "",
    interes: "",
    estado_pago: "PENDIENTE" as ClientRecord["estado_pago"],
  });

  return (
    <section className="grid gap-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.nombre.trim()) return;
          addClient({
            nombre: draft.nombre,
            tipo_contacto: "Manual",
            contacto: draft.contacto,
            interes: draft.interes,
            estado: "INTERESADO",
            estado_pago: draft.estado_pago,
            fecha_entrega: "",
            presupuesto: "",
            gastos: "",
            total_gastado: 0,
            total_pagado: 0,
          });
          setDraft({ nombre: "", contacto: "", interes: "", estado_pago: "PENDIENTE" });
        }}
        className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">CRM operativo</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Agregar cliente</h2>
            <p className="text-sm text-slate-500">Controla estado comercial, pago, gasto y cobro por trabajo.</p>
          </div>
          <button className="inline-flex w-max items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]">
            Agregar cliente <Plus size={16} />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_1fr_190px]">
          <input value={draft.nombre} onChange={(event) => setDraft((current) => ({ ...current, nombre: event.target.value }))} placeholder="Nombre del cliente" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.contacto} onChange={(event) => setDraft((current) => ({ ...current, contacto: event.target.value }))} placeholder="Contacto" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.interes} onChange={(event) => setDraft((current) => ({ ...current, interes: event.target.value }))} placeholder="Interes / proyecto" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <select value={draft.estado_pago} onChange={(event) => setDraft((current) => ({ ...current, estado_pago: event.target.value as ClientRecord["estado_pago"] }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white">
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="SENA">SENA</option>
            <option value="PARCIAL">PARCIAL</option>
            <option value="PAGADO">PAGADO</option>
          </select>
        </div>
      </form>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
        <PanelHeader title="Clientes" helper={`${clients.length} oportunidades y trabajos`} icon={BriefcaseBusiness} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Interes</th>
                <th className="px-4 py-3">Estado trabajo</th>
                <th className="px-4 py-3">Estado pago</th>
                <th className="px-4 py-3">Gastado</th>
                <th className="px-4 py-3">Pagado</th>
                <th className="px-4 py-3">Detalle cliente</th>
                <th className="px-4 py-3">Borrar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-50/35">
                  <td className="px-4 py-3"><input value={client.nombre} onChange={(event) => update(client.id, "nombre", event.target.value)} className="w-48 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={client.contacto} onChange={(event) => update(client.id, "contacto", event.target.value)} className="w-36 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={client.interes} onChange={(event) => update(client.id, "interes", event.target.value)} className="w-44 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3">
                    <select value={client.estado} onChange={(event) => update(client.id, "estado", event.target.value as ClientRecord["estado"])} className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none focus:border-blue-400">
                      <option value="CERRADO">CERRADO</option><option value="ENTREGADO">ENTREGADO</option><option value="INTERESADO">INTERESADO</option><option value="OTRO">OTRO</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={client.estado_pago} onChange={(event) => update(client.id, "estado_pago", event.target.value as ClientRecord["estado_pago"])} className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none focus:border-blue-400">
                      <option value="PENDIENTE">PENDIENTE</option><option value="SENA">SENA</option><option value="PARCIAL">PARCIAL</option><option value="PAGADO">PAGADO</option>
                    </select>
                  </td>
                  <td className="px-4 py-3"><input type="text" inputMode="decimal" value={client.total_gastado} onChange={(event) => update(client.id, "total_gastado", parseAmount(event.target.value))} className="number-font w-32 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input type="text" inputMode="decimal" value={client.total_pagado} onChange={(event) => update(client.id, "total_pagado", parseAmount(event.target.value))} className="number-font w-32 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3">
                    <details className="rounded-xl bg-slate-50 p-2">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-700">Abrir costos y pagos</summary>
                      <div className="mt-2 grid gap-1 text-xs text-slate-600">
                        <p>Gastado: {formatCurrency(client.total_gastado)}</p>
                        <p>Pagado: {formatCurrency(client.total_pagado)}</p>
                        <p>Saldo: {formatCurrency(client.total_pagado - client.total_gastado)}</p>
                      </div>
                    </details>
                  </td>
                  <td className="px-4 py-3"><ConfirmDeleteButton onConfirm={() => deleteClient(client.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ProvidersTable() {
  const providers = useFinanceStore((state) => state.providers);
  const update = useFinanceStore((state) => state.updateProvider);
  const addProvider = useFinanceStore((state) => state.addProvider);
  const deleteProvider = useFinanceStore((state) => state.deleteProvider);
  const [draft, setDraft] = useState({ nombre: "", tipo: "", contacto: "", archivo: "" });

  return (
    <section className="grid gap-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.nombre.trim()) return;
          addProvider({ ...draft, fecha_lista_precios: "" });
          setDraft({ nombre: "", tipo: "", contacto: "", archivo: "" });
        }}
        className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Supply chain</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Agregar proveedor</h2>
            <p className="text-sm text-slate-500">Contactos, catalogos, listas de precio y rubros.</p>
          </div>
          <button className="inline-flex w-max items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]">
            Agregar proveedor <Plus size={16} />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <input value={draft.nombre} onChange={(event) => setDraft((current) => ({ ...current, nombre: event.target.value }))} placeholder="Proveedor" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.tipo} onChange={(event) => setDraft((current) => ({ ...current, tipo: event.target.value }))} placeholder="Rubro" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.contacto} onChange={(event) => setDraft((current) => ({ ...current, contacto: event.target.value }))} placeholder="Contacto" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.archivo} onChange={(event) => setDraft((current) => ({ ...current, archivo: event.target.value }))} placeholder="Catalogo/lista" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
        </div>
      </form>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
        <PanelHeader title="Proveedores" helper={`${providers.length} proveedores activos`} icon={Factory} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Proveedor</th><th className="px-4 py-3">Rubro</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Archivo</th><th className="px-4 py-3">Lista</th><th className="px-4 py-3">Borrar</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-blue-50/35">
                  <td className="px-4 py-3"><input value={provider.nombre} onChange={(event) => update(provider.id, "nombre", event.target.value)} className="w-56 rounded-lg border border-transparent bg-transparent px-2 py-1 font-medium outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={provider.tipo} onChange={(event) => update(provider.id, "tipo", event.target.value)} className="w-36 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={provider.contacto} onChange={(event) => update(provider.id, "contacto", event.target.value)} className="number-font w-40 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input value={provider.archivo} onChange={(event) => update(provider.id, "archivo", event.target.value)} className="w-72 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><input type="date" value={provider.fecha_lista_precios} onChange={(event) => update(provider.id, "fecha_lista_precios", event.target.value)} className="rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-slate-300 focus:bg-white" /></td>
                  <td className="px-4 py-3"><ConfirmDeleteButton onConfirm={() => deleteProvider(provider.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function SurveysPanel() {
  const surveys = useFinanceStore((state) => state.surveys);
  const addSurvey = useFinanceStore((state) => state.addSurvey);
  const updateSurvey = useFinanceStore((state) => state.updateSurvey);
  const deleteSurvey = useFinanceStore((state) => state.deleteSurvey);
  const [draft, setDraft] = useState<Omit<SurveyRecord, "id">>({
    cliente: "",
    direccion: "",
    fecha: new Date().toISOString().slice(0, 10),
    hora: "10:00",
    estado: "PROGRAMADO",
    recordatorio_minutos: 60,
    contacto: "",
    notas: "",
  });

  const upcoming = useMemo(
    () => [...surveys].sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`)),
    [surveys],
  );

  return (
    <section className="grid gap-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.cliente.trim() || !draft.direccion.trim()) return;
          addSurvey(draft);
          setDraft({ ...draft, cliente: "", direccion: "", contacto: "", notas: "" });
        }}
        className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]"
      >
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Agenda</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Nuevo relevamiento</h2>
            <p className="text-sm text-slate-500">Registra visitas, horarios y recordatorios internos.</p>
          </div>
          <button className="inline-flex w-max items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]">
            Agendar <CalendarClock size={16} />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_120px_150px]">
          <input value={draft.cliente} onChange={(event) => setDraft((current) => ({ ...current, cliente: event.target.value }))} placeholder="Cliente" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input value={draft.direccion} onChange={(event) => setDraft((current) => ({ ...current, direccion: event.target.value }))} placeholder="Direccion" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input type="date" value={draft.fecha} onChange={(event) => setDraft((current) => ({ ...current, fecha: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <input type="time" value={draft.hora} onChange={(event) => setDraft((current) => ({ ...current, hora: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          <select value={draft.recordatorio_minutos} onChange={(event) => setDraft((current) => ({ ...current, recordatorio_minutos: Number(event.target.value) }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white">
            <option value={30}>30 min antes</option><option value={60}>1 hora antes</option><option value={1440}>1 dia antes</option>
          </select>
        </div>
      </form>

      <div className="grid gap-3">
        {upcoming.map((survey) => (
          <article key={survey.id} className="rounded-[1.35rem] border border-white/70 bg-white/95 p-4 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.55)]">
            <div className="grid gap-3 md:grid-cols-[1fr_160px_150px_160px_auto] md:items-center">
              <div>
                <input value={survey.cliente} onChange={(event) => updateSurvey(survey.id, "cliente", event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-semibold text-slate-950 outline-none focus:border-slate-300 focus:bg-white" />
                <input value={survey.direccion} onChange={(event) => updateSurvey(survey.id, "direccion", event.target.value)} className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-slate-500 outline-none focus:border-slate-300 focus:bg-white" />
              </div>
              <input type="date" value={survey.fecha} onChange={(event) => updateSurvey(survey.id, "fecha", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-blue-400" />
              <input type="time" value={survey.hora} onChange={(event) => updateSurvey(survey.id, "hora", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-blue-400" />
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                <Bell size={14} /> {survey.recordatorio_minutos} min antes
              </div>
              <ConfirmDeleteButton onConfirm={() => deleteSurvey(survey.id)} />
            </div>
          </article>
        ))}
        {!surveys.length && (
          <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-blue-50/60 p-8 text-center text-sm text-blue-800">
            No hay relevamientos agendados. Carga el primero para usar esta agenda operativa.
          </div>
        )}
      </div>
    </section>
  );
}

export function PipelinePanel() {
  const meta = useFinanceStore((state) => state.spreadsheetMeta());
  const lowConfidence = useFinanceStore((state) => state.lowConfidenceCount());

  return (
    <section className="grid gap-5">
      <div className="rounded-[1.5rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
        <PanelHeader title="Pipeline Drive + Sheets + OCR" helper="Arquitectura preparada para sync real y cache local" icon={ReceiptText} />
        <div className="grid gap-3 p-5 md:grid-cols-4">
          {[
            ["Drive folder", "Clasifica archivos por MIME type"],
            ["Sheets API", "Lee pestanas estructuradas"],
            ["OCR Vision", "PDF e imagenes de facturas"],
            ["Normalizador", "JSON unico para frontend"],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{body}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
          Fuente actual: {meta.title}. Pestanas: {meta.tabs.join(", ")}. Registros OCR a revisar: {lowConfidence}.
        </div>
      </div>
    </section>
  );
}
