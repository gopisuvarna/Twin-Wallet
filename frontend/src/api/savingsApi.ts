import apiClient from './client';

export interface SavingsGoalCreateData {
  goal_name: string;
  target_amount: number;
  target_date?: string | null;
}

export interface SavingsGoalResponseData {
  id: string;
  wallet_id: string;
  goal_name: string;
  target_amount: number;
  current_progress: number;
  completion_percentage: number;
  target_date?: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface PartnerSavingsItemData {
  user_id: string;
  user_name: string;
  monthly_income: number;
  monthly_expense: number;
  monthly_savings: number;
  lifetime_savings: number;
}

export interface SavingsOverviewResponseData {
  year: number;
  month: number;
  combined_monthly_savings: number;
  combined_lifetime_savings: number;
  partner_savings: PartnerSavingsItemData[];
}

export const savingsApi = {
  getSavingsGoals: () =>
    apiClient.get<SavingsGoalResponseData[]>('/savings/'),

  getSavingsOverview: (year: number, month: number) =>
    apiClient.get<SavingsOverviewResponseData>('/savings/overview', { params: { year, month } }),

  createSavingsGoal: (data: SavingsGoalCreateData) =>
    apiClient.post<SavingsGoalResponseData>('/savings/', data),

  deleteSavingsGoal: (goalId: string) =>
    apiClient.delete(`/savings/${goalId}`),
};
