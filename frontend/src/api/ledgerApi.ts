import apiClient from './client';

export const ledgerApi = {
  getSummary: (year: number, month: number) =>
    apiClient.get('/ledger/summary', { params: { year, month } }),
  rollForward: (targetYear: number, targetMonth: number) =>
    apiClient.post('/ledger/roll-forward', { target_year: targetYear, target_month: targetMonth }),
};
