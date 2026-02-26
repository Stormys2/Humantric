import axios from 'axios';

const API_URL = 'https://humantric.up.railway.app/'; // se actualizará cuando hagamos el backend

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('h_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authAPI = {
  register: (username, password) => api.post('/auth/register', { username, password }),
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('h_token', res.data.access_token);
    localStorage.setItem('h_user', username);
    return res;
  },
  logout: () => {
    localStorage.removeItem('h_token');
    localStorage.removeItem('h_user');
  },
};

export const logsAPI = {
  getAll: () => api.get('/logs/'),
  save:   (data) => api.post('/logs/', data),
  update: (date, data) => api.put(`/logs/${date}`, data),
};
