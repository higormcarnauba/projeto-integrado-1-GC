import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
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

const errorTextFieldStyle = {
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: 'red !important',
    },
    '& .MuiOutlinedInput-root.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'darkred !important',
    },
    '& .MuiInputLabel-root.Mui-error': {
        color: 'red !important',
    },
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const Logo = () => (
  <Box
    component="img"
    sx={{
      width: 60,
      height: 'auto',
      mb: 1,
    }}
    alt="CF Gestão Logo"
    src={logoImage}
  />
);

function LoginPage() {
  const navigate = useNavigate();
  
  // Estados unificados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados de erro visual (vindos da develop)
  const [error, setError] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const [fieldErrors, setFieldErrors] = useState({}); 

  const handleLogin = async (event) => {
    event.preventDefault();
    
    setError(false);
    setErrorMessage('');
    setFieldErrors({});

    if (!validateEmail(email)) {
      setFieldErrors({ email: true });
      setErrorMessage("Formato de e-mail inválido.");
      setError(true);
      return;
    }

    if (!password) {
      setFieldErrors({ password: true });
      setErrorMessage("A senha é obrigatória.");
      setError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login realizado com sucesso:", data);
        
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user)); 
        
        navigate('/');
      } else {
        setError(true);
        setErrorMessage(data.error || 'Credenciais inválidas.');
        setFieldErrors({ email: true, password: true });
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setError(true);
      setErrorMessage('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = (event) => {
    event.preventDefault();
    navigate('/esqueci-senha');
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (error) {
        setError(false);
        setFieldErrors({});
        setErrorMessage('');
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (error) {
        setError(false);
        setFieldErrors({});
        setErrorMessage('');
    }
  };

  const isEmailError = !!fieldErrors.email;
  const isPasswordError = !!fieldErrors.password;
  const showHelperText = Object.keys(fieldErrors).length > 0;

  return (
    <Container
      component="main"
      sx={{
        maxWidth: '340px !important',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Logo />

        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 400,
            mb: 3,
            color: 'text.secondary',
          }}
        >
          Corpo em Forma Gestão
        </Typography>

        {error && (
            <Typography 
                color="error" 
                variant="body2" 
                mb={2} 
                textAlign="center" 
                fontWeight="bold"
                sx={{ backgroundColor: '#ffebee', p: 1, borderRadius: 1, width: '100%' }}
            >
                {errorMessage}
            </Typography>
        )}

        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
          
          <TextField
            margin="dense"
            size="small"
            required
            fullWidth
            id="email"
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            error={isEmailError}
            sx={{...blackFocusedTextFieldStyle, ...(isEmailError && errorTextFieldStyle)}}
          />
          <TextField
            margin="dense"
            size="small"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            error={isPasswordError}
            sx={{...blackFocusedTextFieldStyle, ...(isPasswordError && errorTextFieldStyle)}}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
              mt: 1,
            }}
          >
            <Link
              href="#"
              variant="body2"
              onClick={handleForgotPasswordClick}
              sx={{ cursor: 'pointer' }}
            >
              Esqueceu sua senha?
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !email.trim() || !password.trim()} 
            sx={{
              mt: 2,
              mb: 2,
              py: 1.2,
              backgroundColor: '#F2D95C',
              color: 'black',
              '&:hover': {
                backgroundColor: '#E0C84D',
              },
              '&.Mui-disabled': {
                backgroundColor: '#F7E9A9',
                color: 'rgba(0, 0, 0, 0.4)',
              },
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;