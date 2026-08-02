import apiClient from './client';

export interface BudgetCreateData {
  category?: string | null;
  amount_limit: number;
  year: number;
  month: number;
}

export interface BudgetResponseData {
  id: string;
  wallet_id: string;
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
};
