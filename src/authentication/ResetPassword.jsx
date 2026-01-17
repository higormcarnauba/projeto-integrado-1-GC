import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, CircularProgress, Alert
} from '@mui/material';
import logoImage from '../assets/logo/icon.png';

const blackFocusedTextFieldStyle = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'black',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'black',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#343a40',
  },
};

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!email || !code || !newPassword) return;

    setLoading(true);
    setStatus({ message: '', type: '' });

    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      
      setStatus({ message: 'Senha alterada com sucesso! Redirecionando...', type: 'success' });
      
      setTimeout(() => navigate('/login'), 2500);

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Erro ao redefinir senha. Verifique o código.';
      setStatus({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" sx={{ maxWidth: '340px !important', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        
        <Box component="img" src={logoImage} sx={{ width: 60, mb: 1 }} alt="Logo" />
        
        <Typography variant="h6" component="h1" sx={{ fontWeight: 400, mb: 1, color: 'text.secondary' }}>
          Corpo em Forma Gestão
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 500, mt: 2, mb: 2 }}>
          Nova Senha
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={blackFocusedTextFieldStyle}
          />
          
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            label="Código de Verificação (6 dígitos)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 6 }}
            sx={blackFocusedTextFieldStyle}
          />

          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            type="password"
            label="Nova Senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            sx={blackFocusedTextFieldStyle}
          />

          {status.message && (
            <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.2, 
              backgroundColor: '#F2D95C', 
              color: 'black', 
              '&:hover': { backgroundColor: '#E0C84D' },
              '&.Mui-disabled': { backgroundColor: '#F7E9A9', color: 'rgba(0,0,0,0.4)' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Alterar Senha'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default ResetPassword;