import apiClient from './client';

export const transactionApi = {
  createIncome: (data: { amount: number; source: string; description?: string; transaction_date: string }) =>
    apiClient.post('/incomes/', data),

  listIncomes: (params?: { year?: number; month?: number; user_id?: string }) =>
    apiClient.get('/incomes/', { params }),

  updateIncome: (incomeId: string, data: { amount?: number; source?: string; description?: string; transaction_date?: string }) =>
    apiClient.put(`/incomes/${incomeId}`, data),

  deleteIncome: (incomeId: string) =>
    apiClient.delete(`/incomes/${incomeId}`),

  createExpense: (data: { amount: number; category: string; description?: string; transaction_date: string }) =>
    apiClient.post('/expenses/', data),

  listExpenses: (params?: { year?: number; month?: number; category?: string; user_id?: string }) =>
    apiClient.get('/expenses/', { params }),

  updateExpense: (expenseId: string, data: { amount?: number; category?: string; description?: string; transaction_date?: string }) =>
    apiClient.put(`/expenses/${expenseId}`, data),

  deleteExpense: (expenseId: string) =>
    apiClient.delete(`/expenses/${expenseId}`),
};
