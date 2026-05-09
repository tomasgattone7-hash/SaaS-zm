import { googleConfig } from "../../config/google";
import { classifyDriveFile } from "../drive/classifyDriveFiles";
import { listFilesInFolder } from "../drive/driveClient";
import { extractInvoiceFromImage } from "../ocr/extractInvoiceFromImage";
import { extractInvoiceFromPdf } from "../ocr/extractInvoiceFromPdf";
import { extractSheetRows } from "../sheets/extractSheetRows";
import { normalizeExpense } from "./normalizeExpense";

export async function syncFinancialFolder() {
  const files = await listFilesInFolder(googleConfig.financialFolderId);
  const expenses = [];

  for (const file of files) {
    const kind = classifyDriveFile(file);

    if (kind === "sheet") {
      const rows = await extractSheetRows(file.id);
      expenses.push(...rows.map((row) => normalizeExpense(row, "sheet", file)));
      continue;
    }

    if (kind === "pdf") {
      const invoice = await extractInvoiceFromPdf(file);
      expenses.push(normalizeExpense(invoice, "pdf", file));
      continue;
    }

    if (kind === "image") {
      const invoice = await extractInvoiceFromImage(file);
      expenses.push(normalizeExpense(invoice, "image", file));
    }
  }

  return expenses;
}
