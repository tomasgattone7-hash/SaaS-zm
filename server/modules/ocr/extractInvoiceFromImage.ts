import type { DriveFile } from "../drive/classifyDriveFiles";
import type { RawOcrExpense } from "./extractInvoiceFromPdf";

export async function extractInvoiceFromImage(file: DriveFile): Promise<RawOcrExpense> {
  void file;

  throw new Error(
    "Image OCR not configured. Route downloaded image bytes to the selected Vision model and return RawOcrExpense.",
  );
}
