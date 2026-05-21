import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://task-manager-production-9cb0.up.railway.app/api'
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
