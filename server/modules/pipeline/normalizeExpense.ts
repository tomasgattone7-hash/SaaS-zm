import type { DriveFile } from "../drive/classifyDriveFiles";
import type { RawOcrExpense } from "../ocr/extractInvoiceFromPdf";
import type { RawSheetExpense } from "../sheets/extractSheetRows";

export type ExpenseOrigin = "sheet" | "pdf" | "image" | "manual";

export type ExpenseCategory =
  | "Corte"
  | "Enchapado"
  | "Herrajes"
  | "Melamina"
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
  archivo_nombre?: string;
  confianza_ocr?: number;
  editable?: boolean;
};

const categoryKeywords: Record<ExpenseCategory, string[]> = {
  Corte: ["corte", "seccionado", "seccionadora"],
  Enchapado: ["enchapado", "pegado", "canto", "tapacanto"],
  Herrajes: ["herrajes", "bisagra", "corredera", "tirador"],
  Melamina: ["melamina", "placa", "mdf", "fibrofacil"],
  Flete: ["flete", "envio", "logistica"],
  Servicios: ["luz", "gas", "alquiler", "seguro"],
  Otros: [],
};

function suggestCategory(input: string): ExpenseCategory {
  const text = input.toLowerCase();
  const match = Object.entries(categoryKeywords).find(([, words]) =>
    words.some((word) => text.includes(word)),
  );

  return (match?.[0] as ExpenseCategory) ?? "Otros";
}

function toNumber(value: number | string | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(String(value).replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")) || 0;
}

export function normalizeExpense(
  raw: RawSheetExpense | RawOcrExpense,
  origin: ExpenseOrigin,
  file: DriveFile,
): ExpenseRecord {
  const proveedor = raw.proveedor ?? "Proveedor sin identificar";
  const categorySeed = `${proveedor} ${raw.categoria ?? ""} ${file.name}`;

  return {
    id: raw.id ?? `${file.id}-${origin}`,
    fecha: raw.fecha ?? new Date().toISOString().slice(0, 10),
    proveedor,
    total: toNumber(raw.total),
    categoria_sugerida: suggestCategory(categorySeed),
    origen_dato: origin,
    archivo_nombre: file.name,
    confianza_ocr: "confidence" in raw ? raw.confidence : undefined,
    editable: true,
  };
}
