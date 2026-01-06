import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/planos`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const getPlanos = () => apiClient.get('/');

export const getPlanoByCod = (cod_plano) => apiClient.get(`/${cod_plano}`);

export const createPlano = (data) => apiClient.post('/', data);

export const updatePlano = (cod_plano, data) => apiClient.put(`/${cod_plano}`, data);

export const deletePlano = (cod_plano) => apiClient.delete(`/${cod_plano}`);