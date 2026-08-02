import apiClient from './client';

export const reportApi = {
  exportPdf: (year: number, month: number) =>
    apiClient.get('/reports/pdf', {
      params: { year, month },
      responseType: 'arraybuffer',
    }),

  exportCsv: (year: number, month: number) =>
    apiClient.get('/reports/csv', {
      params: { year, month },
      responseType: 'text',
    }),
};
