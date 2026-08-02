import axios from 'axios';

// Local Network Base URL (Replace 192.168.1.5 with your local IP if changed)
export const API_BASE_URL = 'http://192.168.1.5:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let tokenGetter: (() => string | null) | null = null;

export const setAuthTokenGetter = (getter: () => string | null) => {
  tokenGetter = getter;
};

apiClient.interceptors.request.use((config) => {
  if (tokenGetter) {
    const token = tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
