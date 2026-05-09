import type { DriveFile } from "../drive/classifyDriveFiles";

export type RawOcrExpense = {
  fecha?: string;
  proveedor?: string;
  total?: number | string;
  categoria?: string;
  confidence?: number;
};

export async function extractInvoiceFromPdf(file: DriveFile): Promise<RawOcrExpense> {
  void file;

  throw new Error(
    "PDF OCR not configured. Route downloaded PDF bytes to Google Document AI or OpenAI Vision and return RawOcrExpense.",
  );
}
