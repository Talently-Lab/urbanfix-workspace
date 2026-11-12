import axios from 'axios';

const getRuntimeEnv = () => {
  return import.meta.env ?? {};
};

const api = axios.create({
  baseURL: getRuntimeEnv().VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const storage = globalThis.localStorage;
  const token = storage?.getItem('token');

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const storage = globalThis.localStorage;
      if (storage) {
        storage.removeItem('token');
        storage.removeItem('user');
      }

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        const event = new Event('urbanfix:unauthorized');
        window.dispatchEvent(event);
      }
    }

    return Promise.reject(err);
  }
);

export default api;