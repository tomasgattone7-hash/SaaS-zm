import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  sheetClients,
  sheetEmployeePayments,
  sheetExpenses,
  sheetProviders,
  sheetSnapshotMeta,
} from "../data/googleSheetSnapshot";
import type {
  AppSection,
  AttachmentRecord,
  ClientRecord,
  EmployeePaymentRecord,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseRecord,
  IncomeRecord,
  MonthlyArchiveRecord,
  ProviderRecord,
  RoiInputs,
  SurveyRecord,
} from "../types/finance";

type FinanceState = {
  activeSection: AppSection;
  currentPeriod: string;
  archives: MonthlyArchiveRecord[];
  openingCashBalance: number;
  expenses: ExpenseRecord[];
  employeePayments: EmployeePaymentRecord[];
  clients: ClientRecord[];
  providers: ProviderRecord[];
  incomes: IncomeRecord[];
  surveys: SurveyRecord[];
  filters: ExpenseFilters;
  roiInputs: RoiInputs;
  isSyncing: boolean;
  syncError: string | null;
  setActiveSection: (section: AppSection) => void;
  closeCurrentMonth: () => void;
  setExpenses: (records: ExpenseRecord[]) => void;
  addExpense: (record: Omit<ExpenseRecord, "id">) => void;
  deleteExpense: (id: string) => void;
  addExpenseAttachment: (id: string, attachment: AttachmentRecord) => void;
  updateExpense: <K extends keyof ExpenseRecord>(
    id: string,
    key: K,
    value: ExpenseRecord[K],
  ) => void;
  setFilter: <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) => void;
  clearFilters: () => void;
  setRoiInput: <K extends keyof RoiInputs>(key: K, value: RoiInputs[K]) => void;
  updateEmployeePayment: <K extends keyof EmployeePaymentRecord>(
    id: string,
    key: K,
    value: EmployeePaymentRecord[K],
  ) => void;
  addEmployeePayment: (record: Omit<EmployeePaymentRecord, "id">) => void;
  deleteEmployeePayment: (id: string) => void;
  addEmployeePaymentAttachment: (id: string, attachment: AttachmentRecord) => void;
  updateClient: <K extends keyof ClientRecord>(id: string, key: K, value: ClientRecord[K]) => void;
  addClient: (record: Omit<ClientRecord, "id">) => void;
  deleteClient: (id: string) => void;
  updateProvider: <K extends keyof ProviderRecord>(
    id: string,
    key: K,
    value: ProviderRecord[K],
  ) => void;
  addProvider: (record: Omit<ProviderRecord, "id">) => void;
  deleteProvider: (id: string) => void;
  addIncome: (record: Omit<IncomeRecord, "id">) => void;
  deleteIncome: (id: string) => void;
  addSurvey: (record: Omit<SurveyRecord, "id">) => void;
  updateSurvey: <K extends keyof SurveyRecord>(id: string, key: K, value: SurveyRecord[K]) => void;
  deleteSurvey: (id: string) => void;
  filteredExpenses: () => ExpenseRecord[];
  serviceOutsourcingMonthlyCost: () => number;
  expenseTotal: () => number;
  employeePaymentTotal: () => number;
  financialOutflowTotal: () => number;
  incomeTotal: () => number;
  netBalance: () => number;
  companyCashBalance: () => number;
  monthlyLeakage: () => number;
  categoryTotals: () => Array<{ categoria: ExpenseCategory; total: number }>;
  lowConfidenceCount: () => number;
  spreadsheetMeta: () => typeof sheetSnapshotMeta;
};

const defaultFilters: ExpenseFilters = {
  from: "",
  to: "",
  proveedor: "",
  categoria: "Todas",
  origen: "Todos",
};

const defaultRoiInputs: RoiInputs = {
  monthlyVolumeRacks: 100,
  capex: 30000,
  grossMonthlyRevenueUsd: 60000,
  cogsUsd: 31500,
  incrementalOpexUsd: 1200,
  assignedFixedCostsUsd: 4200,
  opportunityCostUsd: 8500,
  exchangeRateArsUsd: 1050,
  baselineRacks: 7,
  projectionMonths: 18,
};

function nextPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);
  const date = new Date(year, month, 1);
  return date.toISOString().slice(0, 7);
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
  activeSection: "resumen",
  currentPeriod: "2026-04",
  archives: [],
  openingCashBalance: 0,
  expenses: sheetExpenses,
  employeePayments: sheetEmployeePayments,
  clients: sheetClients,
  providers: sheetProviders,
  incomes: [],
  surveys: [],
  filters: defaultFilters,
  roiInputs: defaultRoiInputs,
  isSyncing: false,
  syncError: null,

  setActiveSection: (section) => set({ activeSection: section }),

  closeCurrentMonth: () =>
    set((state) => {
      const income = state.incomes.reduce((sum, item) => sum + item.total, 0);
      const expenses = state.expenses.reduce((sum, item) => sum + item.total, 0);
      const employeePayments = state.employeePayments.reduce((sum, item) => sum + item.monto, 0);
      const outflow = expenses + employeePayments;
      const net = income - outflow;
      const archive: MonthlyArchiveRecord = {
        id: `archive-${state.currentPeriod}-${Date.now()}`,
        period: state.currentPeriod,
        closedAt: new Date().toISOString(),
        expenses: state.expenses,
        employeePayments: state.employeePayments,
        incomes: state.incomes,
        totals: { income, expenses, employeePayments, outflow, net },
      };

      return {
        archives: [archive, ...state.archives],
        currentPeriod: nextPeriod(state.currentPeriod),
        openingCashBalance: state.openingCashBalance + net,
        expenses: [],
        employeePayments: [],
        incomes: [],
        filters: { ...defaultFilters, from: "", to: "" },
      };
    }),

  setExpenses: (records) => set({ expenses: records }),

  addExpense: (record) =>
    set((state) => ({
      expenses: [
        {
          ...record,
          id: `manual-expense-${Date.now()}`,
          origen_dato: record.origen_dato ?? "manual",
          tipo_movimiento: record.tipo_movimiento ?? "egreso",
          editable: true,
        },
        ...state.expenses,
      ],
    })),

  updateExpense: (id, key, value) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, [key]: value } : expense,
      ),
    })),

  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    })),

  addExpenseAttachment: (id, attachment) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id
          ? { ...expense, attachments: [...(expense.attachments ?? []), attachment] }
          : expense,
      ),
    })),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () => set({ filters: defaultFilters }),

  setRoiInput: (key, value) =>
    set((state) => ({
      roiInputs: { ...state.roiInputs, [key]: value },
    })),

  updateEmployeePayment: (id, key, value) =>
    set((state) => ({
      employeePayments: state.employeePayments.map((payment) =>
        payment.id === id ? { ...payment, [key]: value } : payment,
      ),
    })),

  addEmployeePayment: (record) =>
    set((state) => ({
      employeePayments: [
        {
          ...record,
          id: `manual-payment-${Date.now()}`,
        },
        ...state.employeePayments,
      ],
    })),

  deleteEmployeePayment: (id) =>
    set((state) => ({
      employeePayments: state.employeePayments.filter((payment) => payment.id !== id),
    })),

  addEmployeePaymentAttachment: (id, attachment) =>
    set((state) => ({
      employeePayments: state.employeePayments.map((payment) =>
        payment.id === id
          ? { ...payment, attachments: [...(payment.attachments ?? []), attachment] }
          : payment,
      ),
    })),

  updateClient: (id, key, value) =>
    set((state) => ({
      clients: state.clients.map((client) => (client.id === id ? { ...client, [key]: value } : client)),
    })),

  addClient: (record) =>
    set((state) => ({
      clients: [{ ...record, id: `manual-client-${Date.now()}` }, ...state.clients],
    })),

  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
    })),

  updateProvider: (id, key, value) =>
    set((state) => ({
      providers: state.providers.map((provider) =>
        provider.id === id ? { ...provider, [key]: value } : provider,
      ),
    })),

  addProvider: (record) =>
    set((state) => ({
      providers: [{ ...record, id: `manual-provider-${Date.now()}` }, ...state.providers],
    })),

  deleteProvider: (id) =>
    set((state) => ({
      providers: state.providers.filter((provider) => provider.id !== id),
    })),

  addIncome: (record) =>
    set((state) => ({
      incomes: [{ ...record, id: `manual-income-${Date.now()}` }, ...state.incomes],
    })),

  deleteIncome: (id) =>
    set((state) => ({
      incomes: state.incomes.filter((income) => income.id !== id),
    })),

  addSurvey: (record) =>
    set((state) => ({
      surveys: [{ ...record, id: `manual-survey-${Date.now()}` }, ...state.surveys],
    })),

  updateSurvey: (id, key, value) =>
    set((state) => ({
      surveys: state.surveys.map((survey) => (survey.id === id ? { ...survey, [key]: value } : survey)),
    })),

  deleteSurvey: (id) =>
    set((state) => ({
      surveys: state.surveys.filter((survey) => survey.id !== id),
    })),

  filteredExpenses: () => {
    const { expenses, filters } = get();

    return expenses.filter((expense) => {
      const matchesFrom = !filters.from || expense.fecha >= filters.from;
      const matchesTo = !filters.to || expense.fecha <= filters.to;
      const matchesProveedor =
        !filters.proveedor ||
        expense.proveedor.toLowerCase().includes(filters.proveedor.toLowerCase());
      const matchesCategoria =
        filters.categoria === "Todas" || expense.categoria_sugerida === filters.categoria;
      const matchesOrigen = filters.origen === "Todos" || expense.origen_dato === filters.origen;

      return matchesFrom && matchesTo && matchesProveedor && matchesCategoria && matchesOrigen;
    });
  },

  serviceOutsourcingMonthlyCost: () => {
    const { roiInputs } = get();
    const pilotOutsourcingCostForSevenRacks = 450299;
    return (pilotOutsourcingCostForSevenRacks / roiInputs.baselineRacks) * roiInputs.monthlyVolumeRacks;
  },

  expenseTotal: () => get().expenses.reduce((sum, expense) => sum + expense.total, 0),

  employeePaymentTotal: () =>
    get().employeePayments.reduce((sum, payment) => sum + payment.monto, 0),

  financialOutflowTotal: () => get().expenseTotal() + get().employeePaymentTotal(),

  incomeTotal: () => get().incomes.reduce((sum, income) => sum + income.total, 0),

  netBalance: () => get().incomeTotal() - get().financialOutflowTotal(),

  companyCashBalance: () => get().openingCashBalance + get().netBalance(),

  monthlyLeakage: () => get().serviceOutsourcingMonthlyCost(),

  categoryTotals: () => {
    const totals = new Map<ExpenseCategory, number>();

    for (const expense of get().expenses) {
      totals.set(
        expense.categoria_sugerida,
        (totals.get(expense.categoria_sugerida) ?? 0) + expense.total,
      );
    }

    return Array.from(totals.entries()).map(([categoria, total]) => ({ categoria, total }));
  },

  lowConfidenceCount: () =>
    get().expenses.filter(
      (expense) => typeof expense.confianza_ocr === "number" && expense.confianza_ocr < 0.88,
    ).length,

  spreadsheetMeta: () => sheetSnapshotMeta,
    }),
    {
      name: "aqui-finance-operating-db-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        currentPeriod: state.currentPeriod,
        archives: state.archives,
        openingCashBalance: state.openingCashBalance,
        expenses: state.expenses,
        employeePayments: state.employeePayments,
        clients: state.clients,
        providers: state.providers,
        incomes: state.incomes,
        surveys: state.surveys,
        roiInputs: state.roiInputs,
      }),
    },
  ),
);
