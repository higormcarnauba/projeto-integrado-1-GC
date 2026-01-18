import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Stack, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { getAlunos } from '../../services/alunosApiService';

import CadastroAlunoDialog from '../Alunos/AlunosComponents/CadastroAlunoDialog';
import ItemDialog from '../Patrimonio/PatrimonioComponents/ItemDialog';
import AdminDashboard from './InicioComponents/AdminDashboard';

const FuncionarioDashboard = () => {
  const navigate = useNavigate();
  const [isAlunoDialogOpen, setIsAlunoDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const [totalAlunosAtivos, setTotalAlunosAtivos] = useState(0);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await getAlunos();
        const alunos = response.data || [];
        const ativos = alunos.filter(a => a.status_aluno === 'Ativo').length;
        setTotalAlunosAtivos(ativos);
      } catch (error) {
        console.error("Erro ao buscar contagem de alunos:", error);
      }
    };
    fetchAlunos();
  }, []);

  const shortcutButtonStyle = {
    borderRadius: 50,
    bgcolor: "#F2D95C",
    color: "#111",
    fontWeight: "normal",
    padding: "8px 20px",
    "&:hover": { bgcolor: "#e0c850" },
    whiteSpace: "nowrap",
    flexGrow: 1,
    textTransform: "uppercase",
  };

  const handleSaveAluno = (novoAluno) => {
    console.log("Novo aluno cadastrado (Funcionario):", novoAluno);
    setIsAlunoDialogOpen(false);
  };
  const handleCloseAlunoDialog = () => {
    setIsAlunoDialogOpen(false);
  };

  const handleSaveItem = (novoItem) => {
    console.log("Novo item patrimônio cadastrado:", novoItem);
    setIsItemDialogOpen(false);
  };
  const handleCloseItemDialog = () => {
    setIsItemDialogOpen(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        VISÃO GERAL
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          padding: 3,
          borderRadius: 4,
          marginTop: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
            <Typography variant="h6" color="text.secondary">ALUNOS ATIVOS</Typography>
          </Box>
          {/* Exibe o valor real do banco */}
          <Typography variant="h2" fontWeight="bold">{totalAlunosAtivos}</Typography>
        </Box>
      </Paper>

      <Typography variant="h5" fontWeight="normal" gutterBottom sx={{ mt: 4 }}>
        Atalhos rápidos
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          padding: 3,
          borderRadius: 4,
          marginTop: 2,
        }}
      >
        <Stack direction={{ sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            sx={shortcutButtonStyle}
            onClick={() => navigate("/planos")}
          >
            Visualizar Planos
          </Button>
          <Button
            variant="contained"
            endIcon={<AddIcon />}
            sx={shortcutButtonStyle}
            onClick={() => setIsItemDialogOpen(true)}
          >
            Registrar Novo Item
          </Button>
          <Button
            variant="contained"
            endIcon={<AddIcon />}
            sx={shortcutButtonStyle}
            onClick={() => setIsAlunoDialogOpen(true)}
          >
            Cadastrar Novo Aluno
          </Button>
        </Stack>
      </Paper>

      <CadastroAlunoDialog
        open={isAlunoDialogOpen}
        onClose={handleCloseAlunoDialog}
        onSave={handleSaveAluno}
      />
      <ItemDialog
        open={isItemDialogOpen}
        onClose={handleCloseItemDialog}
        onSave={handleSaveItem}
      />
    </Box>
  );
};

export default function HomePage() {
  const storedData = localStorage.getItem("userData");
  let userRole = "funcionario";

  if (storedData) {
    const parsed = JSON.parse(storedData);

    if (parsed.nivel_acesso) {
      userRole = parsed.nivel_acesso
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    }
  }

  if (userRole.includes("admin")) {
    return <AdminDashboard />;
  }

  return <FuncionarioDashboard />;
}


//integrada!