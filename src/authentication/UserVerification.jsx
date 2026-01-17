import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    createTheme,
    ThemeProvider,
    Stack,
    Snackbar,
    Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const customTheme = createTheme({
    palette: {
        primary: {
            main: '#000000',
        },
        success: {
            main: '#F2D95C',
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000000',
                    },
                },
            },
        },
    },
});

export default function UserVerification({ onVerificationSuccess, onClose, cpf }) {
    const [step, setStep] = useState(0);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [resendTimer, setResendTimer] = useState(0); 
    const [openSnackbar, setOpenSnackbar] = useState(false); 

    const inputRefs = [
        React.useRef(), React.useRef(), React.useRef(),
        React.useRef(), React.useRef(), React.useRef()
    ];

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prevTime) => prevTime - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleCodeChange = (index, value) => {
        const newCode = [...code];
        const digit = value.slice(-1).replace(/[^0-9]/g, '');
        newCode[index] = digit;
        setCode(newCode);

        if (digit && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleContinue = async () => {
        const fullCode = code.join('');
        setError('');

        if (fullCode.length !== 6) {
            setError('Por favor, digite o código completo de 6 dígitos.');
            return;
        }

        if (!cpf) {
            setError('Identificador do usuário ausente para verificação.');
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch('http://localhost:4000/api/verification/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf_funcionario: cpf, code: fullCode })
            });

            const textData = await resp.text();

            let data;
            try {
                data = JSON.parse(textData);
            } catch (e) {
                console.error('Resposta não é JSON:', textData);
                throw new Error('O servidor retornou uma resposta inválida (HTML em vez de JSON). Verifique a URL da API.');
            }

            if (resp.ok) {
                setStep(1);
            } else {
                setError(data.error || data.message || 'Código inválido');
            }
        } catch (err) {
            console.error('Erro ao verificar código:', err);
            if (err.message.includes('HTML')) {
                setError('Erro de conexão com o servidor (Rota não encontrada ou erro interno).');
            } else {
                setError('Erro ao verificar código. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = () => {
        if (resendTimer > 0) return;

        console.log('Código reenviado.');
        
        setResendTimer(60);
        
        setOpenSnackbar(true);
    };

    const handleConcluido = () => {
        if (onVerificationSuccess) {
            onVerificationSuccess();
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const digitInputStyle = {
        width: '40px',
        height: '60px',
        mx: 0.5,
        '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            '& input': {
                textAlign: 'center',
                p: 1,
                fontSize: '1.2rem',
                fontWeight: 'bold',
            },
        },
    };

    const CodeEntryScreen = (
        <>
            <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                Um código de 6 dígitos foi enviado para seu e-mail.
                Por favor, digite-o para Validar.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
                <ThemeProvider theme={customTheme}>
                    {code.map((digit, index) => (
                        <TextField
                            key={index}
                            inputRef={inputRefs[index]}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            variant="outlined"
                            size="small"
                            inputProps={{
                                maxLength: 1,
                                style: { padding: '10px 0' }
                            }}
                            sx={digitInputStyle}
                        />
                    ))}
                </ThemeProvider>
            </Box>

            {error && (
                <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                    {error}
                </Typography>
            )}

            <Button
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                disableRipple
                sx={{
                    textTransform: 'none',
                    color: resendTimer > 0 ? 'text.disabled' : '#1976d2',
                    fontSize: '0.9rem',
                    mb: 3,
                    '&:hover, &:active, &:focus': {
                        backgroundColor: 'transparent',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: 'transparent',
                        color: 'rgba(0, 0, 0, 0.38)'
                    }
                }}
            >
                {resendTimer > 0 
                    ? `Aguarde ${resendTimer}s para reenviar` 
                    : 'Reenviar código caso não tenha chegado'}
            </Button>

            <Stack direction="row" spacing={2} sx={{ mt: 1, width: '100%', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        width: '40%',
                        bgcolor: '#343a40',
                        color: 'white',
                        '&:hover': { bgcolor: '#23272b' },
                        fontWeight: 'normal',
                        textTransform: 'uppercase'
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleContinue}
                    disabled={loading}
                    sx={{
                        width: '40%',
                        bgcolor: '#F2D95C',
                        color: 'black',
                        '&:hover': { bgcolor: '#e0c850' },
                        fontWeight: 'normal',
                        textTransform: 'uppercase'
                    }}
                >
                    {loading ? 'Validando...' : 'Continuar'}
                </Button>
            </Stack>
        </>
    );

    const SuccessScreen = (
        <Box
            sx={{
                textAlign: 'center',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <CheckCircleOutlineIcon sx={{ color: '#F2D95C', fontSize: 60, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Parabéns! Seu e-mail foi validado com sucesso.
            </Typography>

            <Button
                variant="contained"
                onClick={handleConcluido}
                sx={{
                    width: '60%',
                    bgcolor: '#F2D95C',
                    color: 'black',
                    '&:hover': { bgcolor: '#e0c850' },
                    fontWeight: 'normal',
                    textTransform: 'uppercase',
                    mt: 2
                }}
            >
                Concluído
            </Button>
        </Box>
    );

    return (
        <ThemeProvider theme={customTheme}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'background.default',
                    p: 2,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        width: '100%',
                        maxWidth: step === 0 ? 600 : 700,
                        borderRadius: '30px',
                        textAlign: 'center'
                    }}
                >
                    {step === 0 ? CodeEntryScreen : SuccessScreen}
                </Paper>

                <Snackbar 
                    open={openSnackbar} 
                    autoHideDuration={4000} 
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        Novo código enviado para o seu e-mail!
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}