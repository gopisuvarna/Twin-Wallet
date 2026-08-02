import apiClient from './client';

export const authApi = {
  register: (data: { full_name: string; email: string; password: string; avatar_url?: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  getMe: () =>
    apiClient.get('/auth/me'),

  updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
    apiClient.put('/auth/me', data),
};
