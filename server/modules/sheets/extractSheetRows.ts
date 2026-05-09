export type RawSheetExpense = {
  id?: string;
  fecha?: string;
  proveedor?: string;
  total?: number | string;
  categoria?: string;
};

export async function extractSheetRows(spreadsheetId: string): Promise<RawSheetExpense[]> {
  void spreadsheetId;

  throw new Error(
    "Sheets extractor not configured. Install googleapis and map the expected sheet columns into RawSheetExpense.",
  );
}
