import React, { useState, useEffect } from "react";
import { Typography, Box, Paper, Stack, Button, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import * as alunosApi from "../../../services/alunosApiService";
import * as planosApi from "../../../services/planosApiService";
import * as financeiroApi from "../../../services/financeiroApiService";

import CadastroAlunoDialog from "../../Alunos/AlunosComponents/CadastroAlunoDialog";
import ItemDialog from '../../Financeiro/FinanceiroComponents/ItemDialog';

const formatDateForAPI = (dateStr) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const StatCard = ({ title, value, color }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      borderRadius: 3,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="h5" fontWeight="bold">
      <Typography
        component="span"
        variant="h5"
        fontWeight="bold"
        sx={{ color: color }}
      >
        {value}
      </Typography>
    </Typography>
  </Paper>
);

export default function AdminDashboard() {
  const [isAlunoDialogOpen, setIsAlunoDialogOpen] = useState(false);
  const [isReceitaDialogOpen, setIsReceitaDialogOpen] = useState(false);
  const [isDespesaDialogOpen, setIsDespesaDialogOpen] = useState(false);

  const [listaPlanos, setListaPlanos] = useState([]);
  const [totalAlunosAtivos, setTotalAlunosAtivos] = useState(0);
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    receitas: '0,00',
    despesas: '0,00',
    saldo: '0,00'
  });

  const fetchDashboardData = async () => {
    try {
      const planosRes = await planosApi.getPlanos();
      setListaPlanos(planosRes.data);

      const alunosRes = await alunosApi.getAlunos();
      const alunos = alunosRes.data || [];
      const ativos = alunos.filter(a => a.status_aluno === 'Ativo').length;
      setTotalAlunosAtivos(ativos);

      const finRes = await financeiroApi.getLancamentos();
      const lancamentos = finRes.data || [];

      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const doMes = lancamentos.filter(l => {
        const dataL = new Date(l.data);
        return dataL.getMonth() === mesAtual && dataL.getFullYear() === anoAtual;
      });

      const receitas = doMes.filter(l => l.tipo === 'Receita').reduce((acc, curr) => acc + Number(curr.valor), 0);
      const despesas = doMes.filter(l => l.tipo === 'Despesa').reduce((acc, curr) => acc + Number(curr.valor), 0);
      const saldo = receitas - despesas;

      setResumoFinanceiro({
        receitas: `R$ ${receitas.toFixed(2).replace('.', ',')}`,
        despesas: `R$ ${despesas.toFixed(2).replace('.', ',')}`,
        saldo: `R$ ${saldo.toFixed(2).replace('.', ',')}`
      });

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

  const handleSaveAluno = async (novoAluno) => {
    try {
      const payload = {
        matricula: novoAluno.matricula,
        nome_aluno: novoAluno.nome,
        email_aluno: novoAluno.email,
        cpf_aluno: novoAluno.cpf,
        cod_plano: novoAluno.cod_plano,
        data_nascimento: novoAluno.dataNascimento,
        telefone: novoAluno.telefone,
        logradouro: novoAluno.endereco,
        numero: "S/N",
        status_aluno: "Ativo",
        genero: novoAluno.genero,
      };

      await alunosApi.createAluno(payload);
      alert("Aluno cadastrado com sucesso!");
      setIsAlunoDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar aluno.");
    }
  };

  const handleSaveLancamento = async (data, isRecipe) => {
    try {
      const apiDate = formatDateForAPI(data.data);

      const nomeFinal = (isRecipe && data.categoria === 'Alunos' && data.nome_aluno)
        ? data.nome_aluno
        : data.nome;

      const payload = {
        tipo: isRecipe ? 'Receita' : 'Despesa',
        nome: nomeFinal,
        data: apiDate,
        categoria: data.categoria,
        valor: parseFloat(data.valor),
        descricao: data.descricao
      };

      await financeiroApi.createLancamento(payload);
      alert(`${isRecipe ? "Receita" : "Despesa"} registrada com sucesso!`);

      if (isRecipe) setIsReceitaDialogOpen(false);
      else setIsDespesaDialogOpen(false);

      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar lançamento.");
    }
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
          marginTop: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "success.main",
                borderRadius: "50%",
              }}
            />
            <Typography variant="h6" color="text.secondary">
              ALUNOS ATIVOS
            </Typography>
          </Box>
          <Typography variant="h2" fontWeight="bold">{totalAlunosAtivos}</Typography>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Receitas esse mês" value={resumoFinanceiro.receitas} color="green" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Despesas esse mês" value={resumoFinanceiro.despesas} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Resultado no mês" value={resumoFinanceiro.saldo} color="black" />
        </Grid>
      </Grid>

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
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            endIcon={<AddIcon />}
            sx={shortcutButtonStyle}
            onClick={() => setIsReceitaDialogOpen(true)}
          >
            Registrar Receita
          </Button>

          <Button
            variant="contained"
            endIcon={<AddIcon />}
            sx={shortcutButtonStyle}
            onClick={() => setIsDespesaDialogOpen(true)}
          >
            Registrar Despesa
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
        onClose={() => setIsAlunoDialogOpen(false)}
        onSave={handleSaveAluno}
        listaPlanos={listaPlanos}
      />

      <ItemDialog
        open={isReceitaDialogOpen}
        onClose={() => setIsReceitaDialogOpen(false)}
        onSave={(data) => handleSaveLancamento(data, true)}
        isRecipe={true}
        title="Registrar Receita"
      />

      <ItemDialog
        open={isDespesaDialogOpen}
        onClose={() => setIsDespesaDialogOpen(false)}
        onSave={(data) => handleSaveLancamento(data, false)}
        isRecipe={false}
        title="Registrar Despesa"
      />
    </Box>
  );
}

//integrada!