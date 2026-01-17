import React, { useState, useEffect } from 'react';
import {
  Typography, Button, DialogContent,
  DialogActions, TextField,
} from '@mui/material';
import { ModalBase } from "../../../components/ModalBase";

const yellowButtonSx = {
  bgcolor: '#F2D95C',
  color: 'black',
  fontWeight: 'normal',
  '&:hover': { bgcolor: '#e0c850' },
  textTransform: 'none',
};

const grayButtonSx = {
  bgcolor: '#343a40',
  color: 'white',
  fontWeight: 'normal',
  '&:hover': { bgcolor: '#23272b' },
  textTransform: 'none',
};

const blackFocusedTextFieldStyle = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#343a40' },
};

const errorTextFieldStyle = {
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'red !important' },
    '& .MuiOutlinedInput-root.Mui-error:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'darkred !important' },
    '& .MuiInputLabel-root.Mui-error': { color: 'red !important' },
};

export default function AlterarSenhaDialog({ open, onClose }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open) {
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
      setError(false);
      setErrorMessage('');
      setFieldErrors({});
    }
  }, [open]);

  const handleAlterarSenha = async () => {
    setFieldErrors({});
    setErrorMessage('');
    setError(false);

    if (!senhaAtual.trim() || !novaSenha.trim() || !confirmarNovaSenha.trim()) {
        const errors = {};
        if (!senhaAtual) errors.senhaAtual = true;
        if (!novaSenha) errors.novaSenha = true;
        if (!confirmarNovaSenha) errors.confirmarNovaSenha = true;
        
        setFieldErrors(errors);
        setErrorMessage("Por favor, preencha todos os campos.");
        setError(true);
        return;
    }

    if (novaSenha !== confirmarNovaSenha) {
        setFieldErrors({ novaSenha: true, confirmarNovaSenha: true });
        setErrorMessage("As novas senhas não coincidem.");
        setError(true);
        return;
    }

    if (novaSenha.length < 6) {
        setFieldErrors({ novaSenha: true });
        setErrorMessage("A nova senha deve ter pelo menos 6 caracteres.");
        setError(true);
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const userDataString = localStorage.getItem('userData');
        
        if (!userDataString) {
            setErrorMessage("Sessão inválida. Faça login novamente.");
            setError(true);
            return;
        }

        const userData = JSON.parse(userDataString);
        const idUsuario = userData.id_funcionario || userData.id;

        if (!idUsuario) {
            setErrorMessage("Erro: ID do usuário não identificado.");
            setError(true);
            return;
        }

        const response = await fetch(`http://localhost:4000/api/funcionario/alterar-senha/${idUsuario}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                senhaAtual: senhaAtual, 
                novaSenha: novaSenha 
            })
        });

        if (response.ok) {
            alert("Senha alterada com sucesso!");
            onClose();
        } else {
            const data = await response.json();
            setErrorMessage(data.error || "Erro ao alterar senha.");
            setError(true);
            if (data.error?.toLowerCase().includes('senha')) {
                setFieldErrors({ senhaAtual: true });
            }
        }
    } catch (err) {
        setErrorMessage("Erro de conexão com o servidor.");
        setError(true);
    }
  };

  return (
    <ModalBase open={open} onClose={onClose} title="Alterar Senha">
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        {error && (
          <Typography color="error" variant="body2" textAlign="center" fontWeight="bold">
            {errorMessage}
          </Typography>
        )}
        
        <TextField
          autoFocus
          label="Senha Atual*"
          type="password"
          fullWidth
          variant="outlined"
          value={senhaAtual}
          onChange={(e) => { setSenhaAtual(e.target.value); setError(false); }}
          error={!!fieldErrors.senhaAtual}
          sx={{...blackFocusedTextFieldStyle, ...(fieldErrors.senhaAtual && errorTextFieldStyle)}}
        />

        <TextField
          label="Nova Senha*"
          type="password"
          fullWidth
          variant="outlined"
          value={novaSenha}
          onChange={(e) => { setNovaSenha(e.target.value); setError(false); }}
          error={!!fieldErrors.novaSenha}
          sx={{...blackFocusedTextFieldStyle, ...(fieldErrors.novaSenha && errorTextFieldStyle)}}
        />

        <TextField
          label="Confirmar Nova Senha*"
          type="password"
          fullWidth
          variant="outlined"
          value={confirmarNovaSenha}
          onChange={(e) => { setConfirmarNovaSenha(e.target.value); setError(false); }}
          error={!!fieldErrors.confirmarNovaSenha}
          sx={{...blackFocusedTextFieldStyle, ...(fieldErrors.confirmarNovaSenha && errorTextFieldStyle)}}
        />
      </DialogContent>

      <DialogActions sx={{ p: '16px 24px', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} variant="contained" sx={grayButtonSx}>
          CANCELAR
        </Button>
        <Button onClick={handleAlterarSenha} variant="contained" sx={yellowButtonSx}>
          SALVAR SENHA
        </Button>
      </DialogActions>
    </ModalBase>
  );
}