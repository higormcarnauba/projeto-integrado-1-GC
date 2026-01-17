import React, { useState, useEffect } from 'react';
import {
  Typography, Button, DialogContent,
  DialogActions, TextField, Box
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

export default function ExcluirUsuarioDialog({ open, onClose, onConfirm, user, currentUser }) {
  const [adminPassword, setAdminPassword] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setAdminPassword('');
      setReason('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    setError('');
    const requesterRole = (currentUser?.role || '').toUpperCase();
    const requiresPassword = requesterRole === 'ADMINISTRADOR' || requesterRole === 'SUPER_ADMIN';

    if (requiresPassword) {
      if (!adminPassword) {
        setError('Digite sua senha para confirmar a ação.');
        return;
      }
      onConfirm({ adminPassword, reason });
    } else {
      onConfirm({});
    }
  };

  if (!user) return null;

  // Lógica para definir o título dinâmico
  const modalTitle = user && currentUser && user.id === currentUser.id
    ? `Você tem certeza que deseja excluir seu usuário: ${user?.nome}?`
    : `Tem certeza que deseja excluir o usuário: ${user?.nome}?`;

  return (
    <ModalBase 
      open={open} 
      onClose={onClose} 
      title={modalTitle}
    >
      <DialogContent sx={{ pt: 1 }}>
        {(() => {
          const requesterRole = (currentUser?.role || '').toUpperCase();
          const requiresPassword = requesterRole === 'ADMINISTRADOR' || requesterRole === 'SUPER_ADMIN';

          if (requiresPassword) {
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Esta ação é irreversível (ou requer auditoria). É necessário digitar sua senha para confirmar.
                </Typography>
                <TextField
                  label="Sua senha de administrador*"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  sx={blackFocusedTextFieldStyle}
                />
                <TextField
                  label="Motivo da exclusão (opcional)"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  sx={blackFocusedTextFieldStyle}
                />
                {error && (
                  <Typography color="error" variant="body2" textAlign="center" fontWeight="bold">
                    {error}
                  </Typography>
                )}
              </Box>
            );
          }

          return <Typography>Confirme a exclusão permanente do usuário.</Typography>;
        })()}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} variant="contained" sx={grayButtonSx}>VOLTAR</Button>
        <Button onClick={handleConfirm} variant="contained" sx={yellowButtonSx}>
          {(user?.role === 'ADMINISTRADOR' || user?.role === 'SUPER_ADMIN') ? 'DEMITIR ADMIN' : 'EXCLUIR'}
        </Button>
      </DialogActions>
    </ModalBase>
  );
}