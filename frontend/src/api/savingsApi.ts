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

export const savingsApi = {
  getSavingsGoals: () =>
    apiClient.get<SavingsGoalResponseData[]>('/savings/'),

  createSavingsGoal: (data: SavingsGoalCreateData) =>
    apiClient.post<SavingsGoalResponseData>('/savings/', data),
};
