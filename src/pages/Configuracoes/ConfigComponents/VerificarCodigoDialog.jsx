import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, DialogContent,
  DialogActions, TextField,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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

function CodigoInput({ code, setCode, isError, setError }) {
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.slice(-1); 
    if (/[0-9]/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
      setError(false);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', my: 3 }}>
      {[...Array(6)].map((_, index) => (
        <TextField
          key={index}
          variant="outlined"
          sx={{ width: 45, height: 45, ...blackFocusedTextFieldStyle, ...(isError && errorTextFieldStyle) }}
          inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.2rem', padding: 10 } }}
          value={code[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          error={isError}
          inputRef={el => inputRefs.current[index] = el}
        />
      ))}
    </Box>
  );
}

export default function VerificarCodigoDialog({ open, onClose, userId, onVerificationSuccess }) {
  const [code, setCode] = useState(['', '', '', '', '', '']); 
  const [step, setStep] = useState('INPUT'); 
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCode(['', '', '', '', '', '']);
      setStep('INPUT');
      setError(false);
      setErrorMessage("");
      setLoading(false);
    }
  }, [open]);

  const handleNextStep = async () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length < 6) {
      setError(true);
      setErrorMessage("Por favor, preencha o código de 6 dígitos.");
      return;
    }

    setLoading(true);
    setError(false);
    setErrorMessage("");

    try {
      const response = await fetch('http://localhost:4000/api/funcionario/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, code: enteredCode })
      });

      if (response.ok) {
        setStep('SUCCESS');
      } else {
        const data = await response.json();
        setError(true);
        setErrorMessage(data.error || "Código inválido ou expirado.");
      }
    } catch (err) {
      setError(true);
      setErrorMessage("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onVerificationSuccess();
    onClose();
  };

  return (
    <ModalBase 
      open={open} 
      onClose={onClose} 
      title={step === 'INPUT' ? "Verificar E-mail" : "Sucesso"}
    >
      {step === 'INPUT' ? (
        <>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Um código de 6 dígitos foi enviado para seu e-mail.
            </Typography>
            
            {error && (
              <Typography color="error" variant="body2" mt={2} textAlign="center" fontWeight="bold">
                {errorMessage}
              </Typography>
            )}

            <CodigoInput 
              code={code} 
              setCode={setCode} 
              isError={error} 
              setError={setError} 
            />

            <Typography 
              variant="caption" 
              display="block" 
              textAlign="center" 
              color="primary" 
              sx={{ cursor: 'pointer', mt: 1, textDecoration: 'underline' }}
            >
              Reenviar código caso não tenha chegado
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
            <Button 
              onClick={onClose} 
              variant="contained" 
              sx={grayButtonSx}
            >
              VOLTAR
            </Button>
            <Button 
              onClick={handleNextStep} 
              variant="contained" 
              sx={yellowButtonSx}
              disabled={loading}
            >
              {loading ? "VERIFICANDO..." : "CONTINUAR"}
            </Button>
          </DialogActions>
        </>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center">
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="body1" textAlign="center">
              Parabéns! Seu e-mail foi<br />validado com sucesso.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
            <Button 
              onClick={handleFinish} 
              variant="contained" 
              sx={{ ...yellowButtonSx, px: 4 }}
            >
              CONCLUÍDO
            </Button>
          </DialogActions>
        </Box>
      )}
    </ModalBase>
  );
}