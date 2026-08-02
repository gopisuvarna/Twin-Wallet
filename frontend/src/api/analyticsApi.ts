import apiClient from './client';

export const analyticsApi = {
  getDashboardAnalytics: (year: number, month: number) =>
    apiClient.get('/analytics/dashboard', { params: { year, month } }),

  downloadPdfReport: (year: number, month: number) =>
    apiClient.get('/reports/pdf', { params: { year, month }, responseType: 'blob' }),

  downloadCsvReport: (year: number, month: number) =>
    apiClient.get('/reports/csv', { params: { year, month }, responseType: 'blob' }),
};
