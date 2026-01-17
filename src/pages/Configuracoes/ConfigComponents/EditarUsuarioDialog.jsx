import React, { useState, useEffect } from 'react';
import {
    Typography, Button, DialogContent,
    DialogActions, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box
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

const isValidCPFFormat = (cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
const formatCPF = (value) => {
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value.substring(0, 14);
};

export default function EditarUsuarioDialog({ open, onClose, onSave, user }) {
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('FUNCIONARIO'); 
    const [senha, setSenha] = useState('');

    const [error, setError] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (user) {
            setNome(user.nome || '');
            setCpf(user.cpf || '');
            setEmail(user.email || '');
            setRole(user.role ? user.role.toUpperCase() : 'FUNCIONARIO'); 
        } else {
            setNome('');
            setCpf('');
            setEmail('');
            setRole('FUNCIONARIO');
        }
        setSenha('');
        
        if (!open) {
            setError(false);
            setFieldErrors({});
            setErrorMessage("");
        }
    }, [user, open]);

    const handleCpfChange = (e) => {
        const formattedCpf = formatCPF(e.target.value);
        setCpf(formattedCpf);
        resetFieldError('cpf');
    };

    const handleNomeChange = (e) => {
        setNome(e.target.value);
        resetFieldError('nome');
    };

    const handleSenhaChange = (e) => {
        setSenha(e.target.value);
        resetFieldError('senha');
    }

    const handleRoleChange = (e) => {
        if (isSuperAdmin) return;
        setRole(e.target.value);
    };

    const resetFieldError = (name) => {
        setError(false);
        setFieldErrors(prev => ({...prev, [name]: false}));
        setErrorMessage("");
    };

    const handleSave = () => {
        let errors = {};
        const hasEmpty = !nome.trim() || !cpf.trim() || !senha.trim();

        if (hasEmpty) {
            if (!nome.trim()) errors.nome = true;
            if (!cpf.trim()) errors.cpf = true;
            if (!senha.trim()) errors.senha = true;
            
            setFieldErrors(errors);
            setErrorMessage("Por favor, preencha todos os campos.");
            setError(true);
            return;
        }
        
        let specificErrors = {};
        if (!isValidCPFFormat(cpf)) { specificErrors.cpf = "Formato de CPF inválido."; }

        const errorCount = Object.keys(specificErrors).length;

        if (errorCount > 0) {
            let message = errorCount === 1 ? Object.values(specificErrors)[0] : "Corrija os campos em erro.";
            setFieldErrors(specificErrors);
            setErrorMessage(message);
            setError(true);
            return;
        }
        
        setError(false);
        setFieldErrors({});
        setErrorMessage("");
        
        onSave({ ...user, nome, cpf, role, senha }); 
    }

    const hasSpecificError = error && !errorMessage.includes("todos os campos");
    const showHelperText = hasSpecificError && Object.keys(fieldErrors).length > 1;

    return (
        <ModalBase open={open} onClose={onClose} title="Editar Usuário">
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
                {error && (
                    <Typography color="error" variant="body2" mb={1} textAlign="center" fontWeight="bold">
                        {errorMessage}
                    </Typography>
                )}
                
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField 
                        autoFocus label="Nome*" fullWidth variant="outlined" 
                        value={nome} onChange={handleNomeChange} 
                        error={!!fieldErrors.nome} 
                        helperText={showHelperText && fieldErrors.nome ? fieldErrors.nome : ""} 
                        sx={{...blackFocusedTextFieldStyle, ...(fieldErrors.nome && errorTextFieldStyle)}} 
                    />
                    
                    <TextField label="E-mail" fullWidth variant="outlined" value={email} disabled={true} sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)' } }} />
                    <TextField label="CPF*" fullWidth variant="outlined" value={cpf} onChange={handleCpfChange} inputProps={{ maxLength: 14 }} error={!!fieldErrors.cpf} helperText={showHelperText && fieldErrors.cpf ? fieldErrors.cpf : ""} sx={{...blackFocusedTextFieldStyle, ...(fieldErrors.cpf && errorTextFieldStyle)}} />
                    
                    <FormControl component="fieldset" sx={{ mt: 1 }}>
                        <FormLabel sx={{ color: '#23272b', '&.Mui-focused': { color: '#23272b' } }} component="legend">Nível de Acesso:</FormLabel>
                        <RadioGroup row name="role" value={role} onChange={handleRoleChange}>
                            {isSuperAdmin ? (
                                <FormControlLabel 
                                    value="SUPER_ADMIN" 
                                    control={<Radio size="small" checked={true} sx={{ '&.Mui-checked': { color: '#F2D95C' }, '&.Mui-disabled': { color: 'rgba(0, 0, 0, 0.38)' } }} />} 
                                    label="Super Admin" 
                                    disabled
                                />
                            ) : (
                                <>
                                    <FormControlLabel value="ADMINISTRADOR" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#F2D95C' } }} />} label="Administrador" />
                                    <FormControlLabel value="FUNCIONARIO" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#F2D95C' } }} />} label="Funcionário" />
                                </>
                            )}
                        </RadioGroup>
                        {isSuperAdmin && (
                            <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>
                                O nível de acesso de Super Admin não pode ser alterado.
                            </Typography>
                        )}
                    </FormControl>

                    <Typography variant="caption" color="text.secondary" sx={{mt: 1}}>
                        Digite <strong>sua senha de administrador</strong> para confirmar a alteração:
                    </Typography>
                    <TextField 
                        label="Senha do Admin*" fullWidth variant="outlined" type="password"
                        value={senha} onChange={handleSenhaChange} 
                        error={!!fieldErrors.senha} 
                        sx={{...blackFocusedTextFieldStyle, ...(fieldErrors.senha && errorTextFieldStyle)}} 
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button onClick={onClose} variant="contained" sx={grayButtonSx}>CANCELAR</Button>
                <Button onClick={handleSave} variant="contained" sx={yellowButtonSx}>SALVAR USUÁRIO</Button>
            </DialogActions>
        </ModalBase>
    );
}