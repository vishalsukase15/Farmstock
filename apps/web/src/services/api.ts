import axios from 'axios';

export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resolveAssetUrl = (url: string) => {
  if (!url || /^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

// Request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmstock_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        localStorage.removeItem('farmstock_token');
        localStorage.removeItem('farmstock_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
