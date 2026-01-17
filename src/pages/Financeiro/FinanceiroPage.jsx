import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import FinanceTable from "./FinanceiroComponents/FinanceTable.jsx";
import ItemDialog from "./FinanceiroComponents/ItemDialog.jsx";
import ConfirmaDialog from "./FinanceiroComponents/ConfirmaDialog.jsx";
import VisaoGeralPainel from "./FinanceiroComponents/VisaoGeralPainel.jsx";
import MenuRelatorios from "./FinanceiroComponents/MenuRelatorios.jsx";

import {
  getLancamentos,
  createLancamento,
  updateLancamento,
  deleteLancamento,
} from "../../services/financeiroApiService";

import { getPlanos } from "../../services/planosApiService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      {...other}
    >
      <Box
        sx={{
          pt: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {children}
      </Box>
    </div>
  );
}

const blackFocusedTextFieldStyle = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "black",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#343a40",
  },
};

const blackTheme = createTheme({
  palette: { primary: { main: "#000000" } },
});

const formatDatabaseDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString("pt-BR");
};

const parseDateString = (dateStr) => {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateForAPI = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function FinanceiroPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [planos, setPlanos] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [receitasPage, setReceitasPage] = useState(0);
  const [despesasPage, setDespesasPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isCurrentRecipe, setIsCurrentRecipe] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const [receitaSearch, setReceitaSearch] = useState("");
  const [receitaCategory, setReceitaCategory] = useState("Todas");
  const [despesaSearch, setDespesaSearch] = useState("");
  const [despesaCategory, setDespesaCategory] = useState("Todas");

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        const parsedUser = JSON.parse(storedData);
        const normalizeRole = (r) =>
          String(r || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").toUpperCase();

        const nivel = normalizeRole(parsedUser?.nivel_acesso);

        if (nivel === "ADMINISTRADOR" || nivel === "SUPER_ADMIN") {
          setHasAccess(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchTransacoes = useCallback(async () => {
    try {
      const response = await getLancamentos();
      const data = response.data;

      const formattedData = data.map((item) => ({
        id: item.id_financeiro,
        tipo: item.tipo,
        nome: item.nome,
        data: formatDatabaseDate(item.data),
        originalDate: item.data,
        categoria: item.categoria,
        valor: Number(item.valor),
        descricao: item.descricao,
      }));
      setTransacoes(formattedData);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    }
  }, []);

  const fetchPlanos = useCallback(async () => {
    try {
      const response = await getPlanos();
      setPlanos(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    }
  }, []);

  useEffect(() => {
    fetchTransacoes();
    fetchPlanos();
  }, [fetchTransacoes, fetchPlanos]);

  const receitasData = useMemo(
    () => transacoes.filter((t) => t.tipo === "Receita"),
    [transacoes]
  );
  const despesasData = useMemo(
    () => transacoes.filter((t) => t.tipo === "Despesa"),
    [transacoes]
  );

  const receitasDoMes = useMemo(() => {
    const m = selectedDate.getMonth();
    const y = selectedDate.getFullYear();
    return receitasData.filter((i) => {
      const d = parseDateString(i.data);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }, [receitasData, selectedDate]);

  const despesasDoMes = useMemo(() => {
    const m = selectedDate.getMonth();
    const y = selectedDate.getFullYear();
    return despesasData.filter((i) => {
      const d = parseDateString(i.data);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }, [despesasData, selectedDate]);

  const { receitasAlunos, outrasReceitas, despesas, resultado } =
    useMemo(() => {
      const rA = receitasDoMes
        .filter((r) => r.categoria === "Alunos")
        .reduce((acc, r) => acc + r.valor, 0);
      const rO = receitasDoMes
        .filter((r) => r.categoria !== "Alunos")
        .reduce((acc, r) => acc + r.valor, 0);
      const rD = despesasDoMes.reduce((acc, r) => acc + r.valor, 0);
      return {
        receitasAlunos: `R$ ${rA.toFixed(2).replace(".", ",")}`,
        outrasReceitas: `R$ ${rO.toFixed(2).replace(".", ",")}`,
        despesas: `R$ ${rD.toFixed(2).replace(".", ",")}`,
        resultado: `R$ ${(rA + rO - rD).toFixed(2).replace(".", ",")}`,
      };
    }, [receitasDoMes, despesasDoMes]);

  const filteredReceitas = useMemo(() => {
    let t = receitasDoMes;
    if (receitaCategory !== "Todas")
      t = t.filter((r) => r.categoria === receitaCategory);
    if (receitaSearch)
      t = t.filter((r) =>
        r.nome.toLowerCase().includes(receitaSearch.toLowerCase())
      );
    return t
      .slice()
      .sort((a, b) => parseDateString(b.data) - parseDateString(a.data));
  }, [receitasDoMes, receitaSearch, receitaCategory]);

  const filteredDespesas = useMemo(() => {
    let t = despesasDoMes;
    if (despesaCategory !== "Todas")
      t = t.filter((d) => d.categoria === despesaCategory);
    if (despesaSearch)
      t = t.filter((d) =>
        d.nome.toLowerCase().includes(despesaSearch.toLowerCase())
      );
    return t
      .slice()
      .sort((a, b) => parseDateString(b.data) - parseDateString(a.data));
  }, [despesasDoMes, despesaSearch, despesaCategory]);

  const handleReceitasPageChange = (e, n) => setReceitasPage(n);
  const handleDespesasPageChange = (e, n) => setDespesasPage(n);
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(+e.target.value);
    setReceitasPage(0);
    setDespesasPage(0);
  };

  const handleOpenAdd = (isR) => {
    setIsCurrentRecipe(isR);
    setCurrentItem(null);
    setIsAddDialogOpen(true);
  };
  const handleEdit = (item, isR) => {
    setIsCurrentRecipe(isR);
    setCurrentItem(item);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (id, isR) => {
    setItemToDelete({ id, type: isR ? "Receita" : "Despesa" });
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setCurrentItem(null);
    setItemToDelete(null);
  };

  const handleSaveNewItem = async (data) => {
    const [d, m, y] = data.data.split("/").map(Number);
    const apiDate = formatDateForAPI(new Date(y, m - 1, d));

    const nomeFinal =
      isCurrentRecipe && data.categoria === "Alunos" && data.nome_aluno
        ? data.nome_aluno
        : data.nome;

    const payload = {
      tipo: isCurrentRecipe ? "Receita" : "Despesa",
      nome: nomeFinal,
      data: apiDate,
      categoria: data.categoria,
      valor: parseFloat(data.valor),
      descricao: data.descricao,
    };

    try {
      await createLancamento(payload);
      await fetchTransacoes();
      handleCloseDialogs();
    } catch (error) {
      alert("Erro ao salvar.");
    }
  };

  const handleUpdateItem = async (data) => {
    const [d, m, y] = data.data.split("/").map(Number);
    const apiDate = formatDateForAPI(new Date(y, m - 1, d));

    const nomeFinal =
      isCurrentRecipe && data.categoria === "Alunos" && data.nome_aluno
        ? data.nome_aluno
        : data.nome;

    const payload = {
      tipo: isCurrentRecipe ? "Receita" : "Despesa",
      nome: nomeFinal,
      data: apiDate,
      categoria: data.categoria,
      valor: parseFloat(data.valor),
      descricao: data.descricao,
    };

    try {
      await updateLancamento(currentItem.id, payload);
      await fetchTransacoes();
      handleCloseDialogs();
    } catch (error) {
      alert("Erro ao atualizar.");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteLancamento(itemToDelete.id);
      await fetchTransacoes();
      handleCloseDialogs();
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const handleTabChange = (e, v) => setTabValue(v);
  const handleDateChange = (d) =>
    setSelectedDate(d && d.toString() !== "Invalid Date" ? d : new Date());

  const handleDownloadReport = async (reportType) => {
    const mesAno = selectedDate.toLocaleString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });
    const mesAnoArquivo = mesAno.replace("/", "-");

    let reportOptions = {
      title: `Relatório (${mesAno})`,
      defaultFileName: `relatorio_${reportType}_${mesAnoArquivo}.pdf`,
      headers: [],
      columnWidths: [],
      data: [],
    };

    let apiToCall = window.electronAPI
      ? window.electronAPI.generateReport
      : null;

    if (!apiToCall) {
      console.warn("API do Electron não detectada.");
      return;
    }

    const receitasAlunosDoMes = receitasDoMes.filter(
      (r) => r.categoria === "Alunos"
    );
    const outrasReceitasDoMes = receitasDoMes.filter(
      (r) => r.categoria !== "Alunos"
    );

    const headersSimples = ["ID", "Nome", "Data", "Categoria", "Valor (R$)"];
    const widthsSimples = [50, 200, 100, 150, 100];
    const formatRowSimples = (row) => [
      String(row.id),
      row.nome || "-",
      row.data || "-",
      row.categoria || "-",
      `R$ ${row.valor.toFixed(2).replace(".", ",")}`,
    ];

    const headersDespesas = [
      "ID",
      "Nome",
      "Data",
      "Categoria",
      "Descrição",
      "Valor (R$)",
    ];
    const widthsDespesas = [40, 120, 70, 100, 180, 80];
    const formatDespesaRow = (row) => [
      String(row.id),
      row.nome || "-",
      row.data || "-",
      row.categoria || "-",
      row.descricao || "-",
      `(R$ ${row.valor.toFixed(2).replace(".", ",")})`,
    ];

    switch (reportType) {
      case "balancete_mes":
        reportOptions.title = `Demonstrativo Contábil (${mesAno})`;
        reportOptions.headers = ["Descrição", "Valor (R$)"];
        reportOptions.columnWidths = [400, 200];
        reportOptions.data = [
          ["Receitas de Alunos", receitasAlunos],
          ["Outras Receitas", outrasReceitas],
          ["TOTAL DE DESPESAS", despesas],
          ["RESULTADO DO MÊS", resultado],
        ];
        break;

      case "receitas_alunos":
        reportOptions.title = `Relatório - Receitas de Alunos (${mesAno})`;
        reportOptions.headers = headersSimples;
        reportOptions.columnWidths = widthsSimples;
        reportOptions.data = receitasAlunosDoMes.map(formatRowSimples);
        break;

      case "outras_receitas":
        reportOptions.title = `Relatório - Outras Receitas (${mesAno})`;
        reportOptions.headers = headersSimples;
        reportOptions.columnWidths = widthsSimples;
        reportOptions.data = outrasReceitasDoMes.map(formatRowSimples);
        break;

      case "todas_receitas":
        reportOptions.title = `Relatório - Todas as Receitas (${mesAno})`;
        reportOptions.headers = headersSimples;
        reportOptions.columnWidths = widthsSimples;
        reportOptions.data = receitasDoMes.map(formatRowSimples);
        break;

      case "todas_despesas":
        reportOptions.title = `Relatório - Todas as Despesas (${mesAno})`;
        reportOptions.headers = headersDespesas;
        reportOptions.columnWidths = widthsDespesas;
        reportOptions.data = despesasDoMes.map(formatDespesaRow);
        break;

      default:
        return;
    }

    try {
      const result = await apiToCall(reportOptions);
      if (result.success) {
        alert(`Relatório salvo com sucesso em:\n${result.path}`);
      } else if (result.error !== "Save dialog canceled") {
        alert(`Falha ao salvar relatório: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao chamar API do Electron:", error);
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
        backgroundColor: "transparent",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          mb: 2,
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Financeiro
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ThemeProvider theme={blackTheme}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <DatePicker
                label="Mês/Ano"
                value={selectedDate}
                onChange={handleDateChange}
                views={["year", "month"]}
                format="MM/yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    InputLabelProps: { shrink: true },
                    sx: { width: "150px", ...blackFocusedTextFieldStyle },
                  },
                }}
              />
            </LocalizationProvider>
          </ThemeProvider>
          {hasAccess && (
            <MenuRelatorios
              onDownloadBalancete={() => handleDownloadReport("balancete_mes")}
              onDownloadReceitasAlunos={() =>
                handleDownloadReport("receitas_alunos")
              }
              onDownloadOutrasReceitas={() =>
                handleDownloadReport("outras_receitas")
              }
              onDownloadTodasReceitas={() =>
                handleDownloadReport("todas_receitas")
              }
              onDownloadTodasDespesas={() =>
                handleDownloadReport("todas_despesas")
              }
            />
          )}
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "black" },
              "& .MuiTab-root.Mui-selected": { color: "black" },
            }}
          >
            <Tab label="Visão Geral" />
            <Tab label="Receitas" />
            <Tab label="Despesas" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {hasAccess ? (
            <VisaoGeralPainel
              receitasAlunos={receitasAlunos}
              outrasReceitas={outrasReceitas}
              despesas={despesas}
              resultado={resultado}
            />
          ) : (
            <Typography sx={{ p: 3, textAlign: "center" }}>
              Acesso restrito.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              flexGrow: 1,
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Pesquisa por Nome"
                  value={receitaSearch}
                  onChange={(e) => setReceitaSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: "300px", ...blackFocusedTextFieldStyle }}
                />
                <FormControl
                  size="small"
                  sx={{ minWidth: 180, ...blackFocusedTextFieldStyle }}
                >
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={receitaCategory}
                    label="Categoria"
                    onChange={(e) => setReceitaCategory(e.target.value)}
                  >
                    <MenuItem value="Todas">Todas</MenuItem>
                    <MenuItem value="Alunos">Alunos</MenuItem>
                    <MenuItem value="Outras">Outras</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                endIcon={<AddIcon />}
                onClick={() => handleOpenAdd(true)}
                sx={{
                  backgroundColor: "#F2D95C",
                  color: "black",
                  borderRadius: "50px",
                  "&:hover": { backgroundColor: "#e0c850" },
                }}
              >
                Registrar Receita
              </Button>
            </Box>
            <FinanceTable
              title=""
              rows={filteredReceitas}
              isRecipe={true}
              page={receitasPage}
              rowsPerPage={rowsPerPage}
              count={filteredReceitas.length}
              onPageChange={handleReceitasPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={hasAccess}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              flexGrow: 1,
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Pesquisa por Nome"
                  value={despesaSearch}
                  onChange={(e) => setDespesaSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: "300px", ...blackFocusedTextFieldStyle }}
                />
                <FormControl
                  size="small"
                  sx={{ minWidth: 180, ...blackFocusedTextFieldStyle }}
                >
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={despesaCategory}
                    label="Categoria"
                    onChange={(e) => setDespesaCategory(e.target.value)}
                  >
                    <MenuItem value="Todas">Todas</MenuItem>
                    <MenuItem value="Instalações e infraestrutura">
                      Instalações e infraestrutura
                    </MenuItem>
                    <MenuItem value="Pessoal">Pessoal</MenuItem>
                    <MenuItem value="Investimentos">Investimentos</MenuItem>
                    <MenuItem value="Operacional e Administrativo">
                      Operacional e Administrativo
                    </MenuItem>
                    <MenuItem value="Outras">Outras</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                endIcon={<AddIcon />}
                onClick={() => handleOpenAdd(false)}
                sx={{
                  backgroundColor: "#F2D95C",
                  color: "black",
                  borderRadius: "50px",
                  "&:hover": { backgroundColor: "#e0c850" },
                }}
              >
                Registrar Despesa
              </Button>
            </Box>
            <FinanceTable
              title=""
              rows={filteredDespesas}
              isRecipe={false}
              page={despesasPage}
              rowsPerPage={rowsPerPage}
              count={filteredDespesas.length}
              onPageChange={handleDespesasPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={hasAccess}
            />
          </Box>
        </TabPanel>
      </Box>

      <ItemDialog
        open={isAddDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleSaveNewItem}
        title={`Adicionar ${isCurrentRecipe ? "Receita" : "Despesa"}`}
        isRecipe={isCurrentRecipe}
        planos={planos} 
      />
      <ItemDialog
        open={isEditDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleUpdateItem}
        title={`Editar ${isCurrentRecipe ? "Receita" : "Despesa"}`}
        itemToEdit={currentItem}
        isRecipe={isCurrentRecipe}
        planos={planos}
      />
      <ConfirmaDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDialogs}
        onConfirm={confirmDelete}
        title={`Tem certeza que deseja excluir esta ${itemToDelete ? itemToDelete.type.toLowerCase() : "transação"}?`}
      />
    </Paper>
  );
}