import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  Chip, 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import * as planosApi from "../../services/planosApiService";
import { PlanoFormDialog } from "./PlanosComponents/PlanoFormDialog";
import { ExcluirPlanoDialog } from "./PlanosComponents/ExcluirPlanoDialog";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

const createData = (nome, codigo, valor, status, duracaoUnidade) => {
  return {
    cod_plano: codigo,
    nome,
    codigo,
    valor: formatCurrency(valor),
    valorOriginal: valor,
    status,
    duracaoUnidade, 
  };
};

const columns = [
  { id: "nome", label: "Nome do Plano" },
  { id: "codigo", label: "Código" },
  { id: "valor", label: "Valor" },
  { id: "duracaoUnidade", label: "Duração" }, 
  { id: "status", label: "Status", align: "center" },
  { id: "actions", label: "Ação", align: "center" },
];

const blackFocusedStyle = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "black",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "black",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#343a40",
  },
};

export default function PlanosPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [statusFilter, setStatusFilter] = useState("Todos");
  const [anchorElReport, setAnchorElReport] = useState(null);

  const loadPlanos = async () => {
    try {
      const response = await planosApi.getPlanos();
      
      console.log("Dados recebidos da API:", response.data);

      const dadosFormatados = response.data.map((p) =>
        createData(
          p.nome_plano,
          p.cod_plano,
          parseFloat(p.valor_plano),
          p.status_plano,
          p.duracao_unidade 
        )
      );
      setRows(dadosFormatados);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    }
  };

  useEffect(() => {
    loadPlanos();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    let tempRows = rows;

    if (statusFilter !== "Todos") {
      tempRows = tempRows.filter((row) => row.status === statusFilter);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempRows = tempRows.filter(
        (row) =>
          row.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
          row.codigo.toString().includes(lowerCaseSearchTerm) ||
          (row.duracaoUnidade && row.duracaoUnidade.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return tempRows;
  }, [searchTerm, statusFilter, rows]);

  const handleNewPlan = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cod_plano) => {
    const plan = rows.find((r) => r.cod_plano === cod_plano);
    setSelectedPlan({
      ...plan,
      valor: plan.valorOriginal,
      id: plan.cod_plano,
      duracaoUnidade: plan.duracaoUnidade,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (cod_plano) => {
    const plan = rows.find((r) => r.cod_plano === cod_plano);
    setSelectedPlan(plan);
    setIsDeleteOpen(true);
  };

  const handleSavePlan = async (payload) => {
    const isEdit = !!selectedPlan;

    try {
      const apiPayload = {
        nome_plano: payload.nome,
        valor_plano: payload.valor,
        status_plano: payload.status,
        duracao_unidade: payload.duracaoUnidade,
      };

      if (isEdit) {
        await planosApi.updatePlano(selectedPlan.cod_plano, apiPayload);
        alert("Plano atualizado com sucesso!");
      } else {
        await planosApi.createPlano(apiPayload);
        alert("Plano criado com sucesso!");
      }

      loadPlanos();
      setIsFormOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Erro ao salvar plano.";
      alert(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedPlan) {
      try {
        await planosApi.deletePlano(selectedPlan.cod_plano);
        alert("Plano excluído com sucesso!");
        loadPlanos();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Erro ao excluir plano.";
        alert(msg);
      }
    }
    setIsDeleteOpen(false);
    setSelectedPlan(null);
  };

  const handleReportMenuClick = (event) =>
    setAnchorElReport(event.currentTarget);
  const handleReportMenuClose = () => setAnchorElReport(null);
  const handleDownloadReport = async () => {
    handleReportMenuClose();

    const reportOptions = {
      title: "Relatório de Planos",
      defaultFileName: `relatorio_planos_${new Date().toISOString().split("T")[0]}.pdf`,
      headers: ["Nome do Plano", "Código", "Valor", "Duração", "Status"],
      columnWidths: [180, 70, 90, 110, 90],
      
      data: filteredRows.map((row) => [
        String(row.nome || ""),
        String(row.codigo || ""), 
        String(row.valor || ""),
        String(row.duracaoUnidade || "-"),
        String(row.status || ""),
      ]),
    };

    try {
      const result = await window.electronAPI.generateReport(reportOptions);

      if (result.success) {
        alert(`Relatório salvo com sucesso em:\n${result.path}`);
      } else if (result.error !== "Save dialog canceled") {
        alert(`Falha ao salvar relatório: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro na geração do relatório:", error);
      alert(`Erro ao gerar relatório: ${error.message}`);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Planos
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Pesquisa por Nome, Código ou Duração"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: "400px", ...blackFocusedStyle }}
          />
          <FormControl
            size="small"
            sx={{ minWidth: 180, ...blackFocusedStyle }}
          >
            <InputLabel>Filtrar por Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filtrar por Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Ativo">Ativo</MenuItem>
              <MenuItem value="Inativo">Inativo</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReportMenuClick}
            endIcon={<ArrowDropDownIcon />}
            sx={{
              color: "text.secondary",
              borderColor: "grey.400",
              fontWeight: "normal",
              borderRadius: "25px",
              "&:hover": { backgroundColor: "#f5f5f5", borderColor: "black" },
            }}
          >
            Relatórios
          </Button>
          <Button
            variant="contained"
            endIcon={<AddIcon />}
            onClick={handleNewPlan}
            sx={{
              backgroundColor: "#F2D95C",
              color: "black",
              borderRadius: "25px",
              fontWeight: "normal",
              "&:hover": { backgroundColor: "#e0c850" },
            }}
          >
            Novo Plano
          </Button>
        </Box>
      </Box>

      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ flexGrow: 1, overflow: "auto" }}>
          <Table stickyHeader aria-label="Tabela de Planos">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    sx={{ fontWeight: "bold", backgroundColor: "#fff" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow
                    hover
                    key={row.cod_plano}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                    }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || "left"}
                        >
                          {column.id === "actions" ? (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                justifyContent: "center",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(row.cod_plano)}
                                sx={{ "&:hover": { color: "#343a40" } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(row.cod_plano)}
                                sx={{ "&:hover": { color: "#343a40" } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : column.id === "status" ? (
                             <Chip 
                                label={value} 
                                size="small"
                                sx={{ 
                                  backgroundColor: value === "Ativo" ? "#e8f5e9" : "#ffebee", 
                                  color: value === "Ativo" ? "#2e7d32" : "#c62828",
                                  fontWeight: "bold",
                                  border: `1px solid ${value === "Ativo" ? "#a5d6a7" : "#ef9a9a"}`
                                }} 
                              />
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
        />
      </Paper>

      <PlanoFormDialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPlan(null);
        }}
        onSave={handleSavePlan}
        planToEdit={selectedPlan}
      />
      <ExcluirPlanoDialog
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedPlan(null);
        }}
        onConfirm={handleConfirmDelete}
        planToDelete={selectedPlan}
      />
      <Menu
        anchorEl={anchorElReport}
        open={Boolean(anchorElReport)}
        onClose={handleReportMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleDownloadReport}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          Relatório de Planos
        </MenuItem>
      </Menu>
    </Paper>
  );
}