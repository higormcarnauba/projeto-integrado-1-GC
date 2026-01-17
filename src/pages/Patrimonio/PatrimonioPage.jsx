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
import ItemDialog from "./PatrimonioComponents/ItemDialog";
import ConfirmaDialog from "./PatrimonioComponents/ConfirmaDialog";
import * as patrimonioApi from "../../services/patrimonioApiService";
import { format, parse, isValid } from "date-fns";

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

const createData = (id, nome, codigo, dataAquisicao, status) => {
  return { id, nome, codigo, dataAquisicao, status };
};

const allRows = [
  createData(1, "Leg Press", "001", "25/07/2020", "Ativo"),
  createData(2, "Esteira Ergométrica", "002", "13/06/2021", "Ativo"),
  createData(13, "Halteres", "013", "15/02/2022", "Inativo"),
];

const columns = [
  { id: "nome", label: "Nome do Item" },
  { id: "codigo", label: "Código" },
  { id: "dataAquisicao", label: "Data de Aquisição" },
  { id: "status", label: "Status", align: "center" },
  { id: "actions", label: "Ação", align: "center" },
];

const primaryColor = "#F2D95C";
const primaryHoverColor = "#e0c850";

export default function PatrimonioPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [rows, setRows] = useState(allRows);

  const [anchorElReport, setAnchorElReport] = useState(null);

  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });
  const showNotification = (severity, message) =>
    setNotification({ open: true, severity, message });
  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchPatrimonios = async () => {
    try {
      const res = await patrimonioApi.getPatrimonios();
      const normalized = (res.data || []).map((r) => ({
        id: r.id_patrimonio || r.id,
        id_patrimonio: r.id_patrimonio || r.id,
        nome: r.nome,
        codigo: r.id_patrimonio ? String(r.id_patrimonio) : r.codigo || "",
        dataAquisicao: r.data_aquisicao || r.dataAquisicao || null,
        data_aquisicao: r.data_aquisicao || r.dataAquisicao || null,
        status: r.status_patrimonio || r.status || "",
        status_patrimonio: r.status_patrimonio || r.status || "",
        _raw: r,
      }));
      setRows(normalized);
    } catch (err) {
      console.error("Erro ao buscar patrimônio", err);
    }
  };

  useEffect(() => {
    fetchPatrimonios();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await patrimonioApi.deletePatrimonio(itemToDelete);
      await fetchPatrimonios();
      showNotification("success", "Patrimônio excluído com sucesso");
    } catch (err) {
      console.error("Erro ao deletar", err);
      const msg =
        err?.response?.data?.error || err?.message || "Erro ao deletar";
      showNotification("error", msg);
    } finally {
      handleCloseDialogs();
    }
  };

  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setCurrentItem(null);
    setItemToDelete(null);
  };

  const handleSaveNewItem = async (data) => {
    try {
      await patrimonioApi.createPatrimonio(data);
      await fetchPatrimonios();
      showNotification("success", "Patrimônio cadastrado com sucesso");
    } catch (err) {
      console.error("Erro ao criar", err);
      const msg = err?.response?.data?.error || err?.message || "Erro ao criar";
      showNotification("error", msg);
    } finally {
      handleCloseDialogs();
    }
  };

  const handleUpdateItem = async (data) => {
    if (!currentItem || !currentItem.id_patrimonio) return;
    try {
      await patrimonioApi.updatePatrimonio(currentItem.id_patrimonio, data);
      await fetchPatrimonios();
      showNotification("success", "Patrimônio atualizado com sucesso");
    } catch (err) {
      console.error("Erro ao atualizar", err);
      const msg =
        err?.response?.data?.error || err?.message || "Erro ao atualizar";
      showNotification("error", msg);
    } finally {
      handleCloseDialogs();
    }
  };

  const filteredRows = useMemo(() => {
    let tempRows = rows || [];

    if (statusFilter !== "Todos") {
      tempRows = tempRows.filter((row) => {
        const s = String(row.status || "").toLowerCase();
        if (statusFilter === "Manutenção")
          return (
            s.includes("manut") ||
            s.includes("manutenção") ||
            s.includes("em manutenção")
          );
        return s === String(statusFilter || "").toLowerCase();
      });
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempRows = tempRows.filter(
        (row) =>
          String(row.nome || "")
            .toLowerCase()
            .includes(lowerSearchTerm) ||
          String(row.codigo || "")
            .toLowerCase()
            .includes(lowerSearchTerm)
      );
    }
    return tempRows;
  }, [searchTerm, statusFilter, rows]);

  function formatDateValue(value) {
    if (!value) return "-";
    try {
      let date;
      if (String(value).includes("-")) {
        date = new Date(value);
      } else {
        date = parse(String(value), "dd/MM/yyyy", new Date());
      }
      if (!isValid(date)) return "-";
      return format(date, "dd/MM/yyyy");
    } catch (e) {
      return "-";
    }
  }

  function displayStatus(value) {
    if (!value) return "-";
    const s = String(value || "").toLowerCase();
    if (s === "ativo") return "Ativo";
    if (s === "inativo") return "Inativo";
    if (
      s.includes("manut") ||
      s.includes("manutenção") ||
      s === "manutenção" ||
      s === "em manutenção"
    )
      return "Em Manutenção";
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  const handleReportMenuClick = (event) => {
    setAnchorElReport(event.currentTarget);
  };

  const handleReportMenuClose = () => {
    setAnchorElReport(null);
  };

  const handleDownloadReport = async () => {
    handleReportMenuClose();
    const reportOptions = {
      title: "Relatório de Patrimônio",
      defaultFileName: `relatorio_patrimonio_${new Date().toISOString().split("T")[0]}.pdf`,
      headers: ["Nome do Item", "Código", "Data de Aquisição", "Status"],
      columnWidths: [300, 120, 150, 172],
      data: filteredRows.map((row) => [
        row.nome,
        row.codigo,
        formatDateValue(row.dataAquisicao),
        displayStatus(row.status),
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
        Patrimônio e Bens
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
            placeholder="Pesquisa por Nome ou Código"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{
              width: "400px",
              ...blackFocusedStyle,
            }}
          />
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              ...blackFocusedStyle,
            }}
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
              <MenuItem value="Manutenção">Manutenção</MenuItem>
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
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "black",
              },
            }}
          >
            Relatórios
          </Button>
          <Button
            variant="contained"
            endIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{
              backgroundColor: primaryColor,
              color: "black",
              fontWeight: "normal",
              borderRadius: "25px",
              "&:hover": {
                backgroundColor: primaryHoverColor,
              },
            }}
          >
            Novo Item
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
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    sx={{ fontWeight: "bold" }}
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
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id_patrimonio || row.id}
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
                                onClick={() => handleEdit(row)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDelete(row.id_patrimonio || row.id)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : column.id === "dataAquisicao" ? (
                            formatDateValue(value)
                          ) : column.id === "status" ? (
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                              <Chip
                                label={displayStatus(value)}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    displayStatus(value) === "Ativo" ? "#e8f5e9" : 
                                    displayStatus(value) === "Em Manutenção" ? "#fff3e0" : "#ffebee",
                                  color:
                                    displayStatus(value) === "Ativo" ? "#2e7d32" : 
                                    displayStatus(value) === "Em Manutenção" ? "#ef6c00" : "#c62828",
                                  fontWeight: "bold",
                                  border: `1px solid ${
                                    displayStatus(value) === "Ativo" ? "#a5d6a7" : 
                                    displayStatus(value) === "Em Manutenção" ? "#ffe0b2" : "#ef9a9a"
                                  }`,
                                }}
                              />
                            </Box>
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
          rowsPerPageOptions={[10, 25, 100]}
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

      <ItemDialog
        open={isAddDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleSaveNewItem}
        title="Cadastrar um Novo Item"
      />

      <ItemDialog
        open={isEditDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleUpdateItem}
        title="Editar Item"
        itemToEdit={currentItem}
      />

      <ConfirmaDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDialogs}
        onConfirm={confirmDelete}
        title="Tem certeza que deseja excluir?"
      />

      <Menu
        anchorEl={anchorElReport}
        open={Boolean(anchorElReport)}
        onClose={handleReportMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleDownloadReport}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          Relatório de Patrimônio
        </MenuItem>
      </Menu>
    </Paper>
  );
}