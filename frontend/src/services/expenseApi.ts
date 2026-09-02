import apiClient from '../api/client';
import {
  IncomeSource,
  ExpenseTransaction,
  ExpenseTask,
  MonthlyNote,
  ExpenseDashboardMetrics,
  ExpenseInsights,
  ExpenseCategory,
  TransactionStatus,
} from '../types/expense';

export const expenseApi = {
  // Budget Months
  getAvailableMonths: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/expenses/months');
    return res.data;
  },

  copyMonth: async (fromMonth: string, toMonth: string, copyIncome = true, copyTransactions = true, copyTasks = true): Promise<void> => {
    await apiClient.post('/expenses/copy-month', { fromMonth, toMonth, copyIncome, copyTransactions, copyTasks });
  },

  // Incomes
  getIncomes: async (month: string): Promise<IncomeSource[]> => {
    const res = await apiClient.get<IncomeSource[]>('/expenses/incomes', { params: { month } });
    return res.data;
  },

  createIncome: async (data: { budgetMonth: string; name: string; amount: number; instrument?: string }): Promise<IncomeSource> => {
    const res = await apiClient.post<IncomeSource>('/expenses/incomes', data);
    return res.data;
  },

  updateIncome: async (id: string, data: { budgetMonth?: string; name: string; amount: number; instrument?: string }): Promise<IncomeSource> => {
    const res = await apiClient.put<IncomeSource>(`/expenses/incomes/${id}`, data);
    return res.data;
  },

  deleteIncome: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/incomes/${id}`);
  },

  // Transactions
  getTransactions: async (params: { month: string; category?: ExpenseCategory; status?: TransactionStatus; search?: string }): Promise<ExpenseTransaction[]> => {
    const res = await apiClient.get<ExpenseTransaction[]>('/expenses/transactions', { params });
    return res.data;
  },

  createTransaction: async (data: Partial<ExpenseTransaction> & { budgetMonth: string; item: string; amount: number; category: ExpenseCategory }): Promise<ExpenseTransaction> => {
    const res = await apiClient.post<ExpenseTransaction>('/expenses/transactions', data);
    return res.data;
  },

  updateTransaction: async (id: string, data: Partial<ExpenseTransaction>): Promise<ExpenseTransaction> => {
    const res = await apiClient.put<ExpenseTransaction>(`/expenses/transactions/${id}`, data);
    return res.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/transactions/${id}`);
  },

  toggleTransactionStatus: async (id: string): Promise<ExpenseTransaction> => {
    const res = await apiClient.patch<ExpenseTransaction>(`/expenses/transactions/${id}/toggle-status`);
    return res.data;
  },

  toggleTransactionIncluded: async (id: string): Promise<ExpenseTransaction> => {
    const res = await apiClient.patch<ExpenseTransaction>(`/expenses/transactions/${id}/toggle-included`);
    return res.data;
  },

  // Tasks
  getTasks: async (month: string): Promise<ExpenseTask[]> => {
    const res = await apiClient.get<ExpenseTask[]>('/expenses/tasks', { params: { month } });
    return res.data;
  },

  createTask: async (data: Partial<ExpenseTask> & { budgetMonth: string; task: string }): Promise<ExpenseTask> => {
    const res = await apiClient.post<ExpenseTask>('/expenses/tasks', data);
    return res.data;
  },

  updateTask: async (id: string, data: Partial<ExpenseTask>): Promise<ExpenseTask> => {
    const res = await apiClient.put<ExpenseTask>(`/expenses/tasks/${id}`, data);
    return res.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/tasks/${id}`);
  },

  // Notes
  getNotes: async (month: string): Promise<MonthlyNote[]> => {
    const res = await apiClient.get<MonthlyNote[]>('/expenses/notes', { params: { month } });
    return res.data;
  },

  createNote: async (budgetMonth: string, content: string): Promise<MonthlyNote> => {
    const res = await apiClient.post<MonthlyNote>('/expenses/notes', { budgetMonth, content });
    return res.data;
  },

  // Metrics & Insights
  getMetrics: async (month: string): Promise<ExpenseDashboardMetrics> => {
    const res = await apiClient.get<ExpenseDashboardMetrics>('/expenses/metrics', { params: { month } });
    return res.data;
  },

  getInsights: async (month: string): Promise<ExpenseInsights> => {
    const res = await apiClient.get<ExpenseInsights>('/expenses/insights', { params: { month } });
    return res.data;
  },
};

export default expenseApi;
