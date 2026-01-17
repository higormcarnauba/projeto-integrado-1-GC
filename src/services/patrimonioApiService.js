import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/patrimonio`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPatrimonios = () => apiClient.get('/');

export const getPatrimonioById = (id) => apiClient.get(`/${id}`);

export const createPatrimonio = (data) => apiClient.post('/', data);

export const updatePatrimonio = (id, data) => apiClient.put(`/${id}`, data);

export const deletePatrimonio = (id) => apiClient.delete(`/${id}`);
