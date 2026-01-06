import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/alunos`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAlunos = () => apiClient.get('/');

export const getAlunoByMatricula = (matricula) => apiClient.get(`/${matricula}`);

export const createAluno = (data) => apiClient.post('/', data);

export const updateAluno = (matricula, data) => apiClient.put(`/${matricula}`, data);

export const deleteAluno = (matricula) => apiClient.delete(`/${matricula}`);

export const renovarPlano = (data) => apiClient.post('/renovar', data);