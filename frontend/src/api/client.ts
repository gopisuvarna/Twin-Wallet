import axios from 'axios';

// Live Production Cloud Backend URL (Render 24/7 Online Service)
export const API_BASE_URL = 'https://twin-wallet.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
