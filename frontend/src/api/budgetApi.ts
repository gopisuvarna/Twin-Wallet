import apiClient from './client';

export interface BudgetCreateData {
  user_id?: string | null;
  category?: string | null;
  amount_limit: number;
  year: number;
  month: number;
}

export interface BudgetUpdateData {
  user_id?: string | null;
  category?: string | null;
  amount_limit?: number;
}

export interface BudgetResponseData {
  id: string;
  wallet_id: string;
  user_id?: string | null;
  user_name?: string | null;
  category?: string | null;
  amount_limit: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  is_exceeded: boolean;
  year: number;
  month: number;
}

export const budgetApi = {
  getBudgets: (year: number, month: number) =>
    apiClient.get<BudgetResponseData[]>('/budgets/', { params: { year, month } }),

  createOrUpdateBudget: (data: BudgetCreateData) =>
    apiClient.post<BudgetResponseData>('/budgets/', data),

  updateBudget: (id: string, data: BudgetUpdateData) =>
    apiClient.put<BudgetResponseData>(`/budgets/${id}`, data),

  deleteBudget: (id: string) =>
    apiClient.delete(`/budgets/${id}`),
};
