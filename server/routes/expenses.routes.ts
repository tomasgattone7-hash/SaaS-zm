import { syncFinancialFolder } from "../modules/pipeline/syncFinancialFolder";

export async function getExpenses() {
  return syncFinancialFolder();
}

export async function patchExpense() {
  throw new Error("Persist manual corrections in the database layer before enabling this route.");
}
