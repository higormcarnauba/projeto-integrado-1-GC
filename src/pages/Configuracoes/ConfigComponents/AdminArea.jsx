import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const yellowButtonSx = {
  bgcolor: '#F2D95C',
  color: 'black',
  fontWeight: 'normal',
  '&:hover': { bgcolor: '#e0c850' },
  textTransform: 'none',
};

export default function AdminArea({
  funcionarios = [],
  onAddUser = () => {},
  onEditUser = () => {},
  onDeleteUser = () => {},
  currentUserId = null,
  currentUserRole = null,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatRole = (role) => {
    if (!role) return "-";
    const roleMap = {
      'ADMINISTRADOR': 'Administrador',
      'SUPER_ADMIN': 'Super Admin',
      'FUNCIONARIO': 'Funcionário',
      'FUNCION_RIO': 'Funcionário'
    };
    const upperRole = String(role).toUpperCase();
    return roleMap[upperRole] || role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="Semi bold">
          Área do Administrador
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          endIcon={<AddIcon />}
          sx={{ ...yellowButtonSx, borderRadius: "20px", px: 2, py: 1 }}
          onClick={onAddUser}
        >
          CADASTRAR NOVO USUÁRIO
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Matrícula</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>CPF</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Nível de Acesso</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {funcionarios
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user, idx) => {
                
                const myRole = (currentUserRole || '').toUpperCase();
                const targetRole = (user.role || '').toUpperCase();
                const isSelf = user.id == currentUserId; 

                const isTargetSuper = targetRole === 'SUPER_ADMIN';
                const isTargetAdmin = targetRole === 'ADMINISTRADOR';
                const isTargetEmployee = !isTargetSuper && !isTargetAdmin; 

                let canEdit = false;
                if (myRole === 'SUPER_ADMIN') {
                  canEdit = true;
                } else if (myRole === 'ADMINISTRADOR') {
                  canEdit = isSelf || isTargetEmployee; 
                } else {
                  canEdit = isSelf; 
                }

                let canDelete = false;
                if (myRole === 'SUPER_ADMIN') {
                  canDelete = !isSelf; 
                } else if (myRole === 'ADMINISTRADOR') {
                  canDelete = isSelf || isTargetEmployee; 
                } else {
                  canDelete = isSelf;
                }

                return (
                  <TableRow
                    key={user.id}
                    sx={(theme) => ({
                      backgroundColor: idx % 2 ? theme.palette.action.hover : "transparent",
                    })}
                  >
                    <TableCell>
                      {user.isEnabled ? (
                        <Chip 
                          icon={<CheckCircleIcon style={{ color: 'green' }} />} 
                          label="Ativo" 
                          size="small" 
                          variant="outlined" 
                          color="success"
                          sx={{ borderColor: 'transparent', '& .MuiChip-label': { color: 'green', fontWeight: 'bold'} }}
                        />
                      ) : (
                        <Chip 
                          icon={<ErrorOutlineIcon style={{ color: 'orange' }} />} 
                          label="Pendente" 
                          size="small" 
                          variant="outlined"
                          color="warning"
                          sx={{ borderColor: 'transparent', '& .MuiChip-label': { color: 'orange', fontWeight: 'bold'} }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{user.nome ?? "-"}</TableCell>
                    <TableCell>{user.matricula ?? "-"}</TableCell>
                    <TableCell>{user.cpf ?? "-"}</TableCell>
                    <TableCell>{user.email ?? "-"}</TableCell>
                    <TableCell>{formatRole(user.role)}</TableCell>
                    <TableCell align="center">
                      {canEdit && (
                        <IconButton onClick={() => onEditUser(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}

                      {canDelete && (
                        <IconButton onClick={() => onDeleteUser(user)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={funcionarios.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por pág:"
        />
      </TableContainer>
    </Box>
  );
}