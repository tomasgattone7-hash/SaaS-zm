export type ExpenseOrigin = "sheet" | "pdf" | "image" | "manual";

export type AttachmentRecord = {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
};

export type ExpenseCategory =
  | "Corte"
  | "Enchapado"
  | "Herrajes"
  | "Melamina"
  | "Produccion Melamina"
  | "Flete"
  | "Servicios"
  | "Otros";

export type ExpenseRecord = {
  id: string;
  fecha: string;
  proveedor: string;
  total: number;
  categoria_sugerida: ExpenseCategory;
  origen_dato: ExpenseOrigin;
  tipo_movimiento?: "ingreso" | "egreso";
  detalle?: string;
  archivo_nombre?: string;
  archivo_nombre_2?: string;
  attachments?: AttachmentRecord[];
  confianza_ocr?: number;
  editable?: boolean;
};

export type ExpenseFilters = {
  from: string;
  to: string;
  proveedor: string;
  categoria: "Todas" | ExpenseCategory;
  origen: "Todos" | ExpenseOrigin;
};

export type RoiInputs = {
  monthlyVolumeRacks: number;
  capex: number;
  grossMonthlyRevenueUsd: number;
  cogsUsd: number;
  incrementalOpexUsd: number;
  assignedFixedCostsUsd: number;
  opportunityCostUsd: number;
  exchangeRateArsUsd: number;
  baselineRacks: number;
  projectionMonths: number;
};

export type EmployeePaymentRecord = {
  id: string;
  empleado: string;
  fecha: string;
  monto: number;
  forma_pago: "TRANSFERENCIA" | "EFECTIVO" | "OTRO";
  comprobante: string;
  attachments?: AttachmentRecord[];
};

export type ClientRecord = {
  id: string;
  nombre: string;
  tipo_contacto: string;
  contacto: string;
  interes: string;
  estado: "CERRADO" | "ENTREGADO" | "INTERESADO" | "OTRO";
  estado_pago: "PENDIENTE" | "SENA" | "PARCIAL" | "PAGADO";
  fecha_entrega: string;
  presupuesto: string;
  gastos: string;
  total_gastado: number;
  total_pagado: number;
  notas?: string;
};

export type ProviderRecord = {
  id: string;
  nombre: string;
  tipo: string;
  contacto: string;
  archivo: string;
  fecha_lista_precios: string;
};

export type IncomeRecord = {
  id: string;
  fecha: string;
  cliente: string;
  detalle: string;
  total: number;
  metodo: "TRANSFERENCIA" | "EFECTIVO" | "OTRO";
  attachments?: AttachmentRecord[];
};

export type SurveyRecord = {
  id: string;
  cliente: string;
  direccion: string;
  fecha: string;
  hora: string;
  estado: "PROGRAMADO" | "REALIZADO" | "REPROGRAMAR" | "CANCELADO";
  recordatorio_minutos: number;
  contacto: string;
  notas: string;
};

export type MonthlyArchiveRecord = {
  id: string;
  period: string;
  closedAt: string;
  expenses: ExpenseRecord[];
  employeePayments: EmployeePaymentRecord[];
  incomes: IncomeRecord[];
  totals: {
    income: number;
    expenses: number;
    employeePayments: number;
    outflow: number;
    net: number;
  };
};

export type AppSection =
  | "resumen"
  | "gastos"
  | "empleados"
  | "clientes"
  | "proveedores"
  | "relevamientos"
  | "roi"
  | "pipeline";
