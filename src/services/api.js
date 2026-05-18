import axios from 'axios';

// Vite exposes env vars via import.meta.env. Use VITE_API_URL for the backend base URL.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE });

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

export default api;
