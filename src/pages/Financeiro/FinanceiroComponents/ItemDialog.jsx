import React, { useState, useEffect } from 'react';
import {
  Box,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { parse } from "date-fns/parse";
import { format } from "date-fns/format";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getAlunos } from "../../../services/alunosApiService";
import { ModalBase } from "../../../components/ModalBase";

const blackFocusedTextFieldStyle = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "black",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#343a40",
  },
  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: "red !important",
  },
};

const formatCurrency = (value) => {
  if (!value) return "";
  const numeric = String(value).replace(/\D/g, "");
  const number = Number(numeric) / 100;
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const blackTheme = createTheme({
  palette: { primary: { main: "#000000" } },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#000000", color: "#FFFFFF" },
          "&.Mui-selected": {
            backgroundColor: "#000000",
            color: "#FFFFFF",
            "&:hover": { backgroundColor: "#333333" },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#343a40",
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "red !important",
          },
          "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23) !important",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": { color: "#000000" },
          "&.Mui-error": { color: "red !important" },
          "&.Mui-disabled": { color: "rgba(0, 0, 0, 0.6)" },
        },
      },
    },
  },
});

export default function ItemDialog({
  open,
  onClose,
  onSave,
  title,
  itemToEdit,
  isRecipe,
  planos, 
}) {
  const [categoria, setCategoria] = useState("");
  const [nome, setNome] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const [data, setData] = useState(new Date());
  const [valorFormatado, setValorFormatado] = useState("");
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState({});
  const [showErrorText, setShowErrorText] = useState(false);

  const [buscaAluno, setBuscaAluno] = useState("");
  const [listaCompletaAlunos, setListaCompletaAlunos] = useState([]);
  const [opcoesAlunos, setOpcoesAlunos] = useState([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  const type = isRecipe ? "receita" : "despesa";
  const categoriasReceita = ["Alunos", "Outras"];
  const categoriasDespesa = [
    "Instalações e infraestrutura",
    "Pessoal",
    "Investimentos",
    "Operacional e Administrativo",
    "Outras",
  ];

  useEffect(() => {
    if (open && isRecipe && categoria === "Alunos") {
      setLoadingAlunos(true);
      getAlunos()
        .then((response) => {
          const rawData = response.data || [];
          const dadosFormatados = rawData.map((aluno) => ({
            ...aluno, 
            id: aluno.id_aluno || aluno.id,
            nome: aluno.nome_aluno || aluno.nome,
            matricula: aluno.matricula || aluno.matricula_aluno,
          }));
          setListaCompletaAlunos(dadosFormatados);
          setOpcoesAlunos(dadosFormatados);
        })
        .catch((error) => {
          console.error("Erro ao buscar alunos:", error);
        })
        .finally(() => {
          setLoadingAlunos(false);
        });
    }
  }, [open, isRecipe, categoria]);

  useEffect(() => {
    if (!buscaAluno) {
      setOpcoesAlunos(listaCompletaAlunos);
    } else {
      const termo = buscaAluno.toLowerCase();
      const filtrados = listaCompletaAlunos.filter(
        (aluno) =>
          (aluno.nome && aluno.nome.toLowerCase().includes(termo)) ||
          (aluno.matricula && String(aluno.matricula).includes(termo))
      );
      setOpcoesAlunos(filtrados);
    }
  }, [buscaAluno, listaCompletaAlunos]);

  useEffect(() => {
    if (isRecipe && categoria === "Alunos" && alunoSelecionado && planos && planos.length > 0) {
      
      if (itemToEdit && itemToEdit.nome === alunoSelecionado.nome) {
        return;
      }

      const codigoPlanoAluno = alunoSelecionado.cod_plano;

      if (codigoPlanoAluno) {
        const planoEncontrado = planos.find(p => String(p.cod_plano) === String(codigoPlanoAluno));
        
        if (planoEncontrado && planoEncontrado.valor_plano) {
          const valorRaw = Number(planoEncontrado.valor_plano).toFixed(2).replace(/\D/g, "");
          setValorFormatado(formatCurrency(valorRaw));
        }
      }
    }
  }, [alunoSelecionado, planos, isRecipe, categoria, itemToEdit]);

  useEffect(() => {
    if (open) {
      if (itemToEdit) {
        setCategoria(itemToEdit.categoria || "");
        setNome(itemToEdit.nome || "");

        let rawValue = "";
        if (itemToEdit.valor !== undefined && itemToEdit.valor !== null) {
          rawValue = Number(itemToEdit.valor).toFixed(2).replace(".", "");
        }
        setValorFormatado(formatCurrency(rawValue));

        setDescricao(itemToEdit.descricao || "");

        let dataObjeto = new Date();
        if (itemToEdit.data) {
          const parsedDate = parse(itemToEdit.data, "dd/MM/yyyy", new Date());
          if (parsedDate.toString() !== "Invalid Date") dataObjeto = parsedDate;
        }
        setData(dataObjeto);

        if (isRecipe && itemToEdit.categoria === "Alunos" && itemToEdit.nome) {
          setAlunoSelecionado({ nome: itemToEdit.nome, matricula: "" });
        } else {
          setAlunoSelecionado(null);
        }
      } else {
        // Reset para Novo Item
        setCategoria("");
        setNome("");
        setData(new Date());
        setValorFormatado("");
        setDescricao("");
        setAlunoSelecionado(null);
        setBuscaAluno("");
      }
      setErrors({});
      setShowErrorText(false);
    }
  }, [itemToEdit, isRecipe, open]);

  const handleValueChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 12) raw = raw.slice(0, 12);
    setValorFormatado(formatCurrency(raw));
  };

  const validateForm = () => {
    const newErrors = {};
    const valorNumerico = Number(valorFormatado.replace(/\D/g, "")) / 100;

    if (!categoria) newErrors.categoria = true;
    if (!data || data.toString() === "Invalid Date") newErrors.data = true;
    if (valorNumerico <= 0) newErrors.valor = true;

    if (isRecipe) {
      if (categoria === "Alunos" && !alunoSelecionado) newErrors.aluno = true;
      if (categoria === "Outras" && !nome.trim()) newErrors.nome = true;
    } else {
      if (!nome.trim()) newErrors.nome = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      setShowErrorText(true);
      return;
    }
    setShowErrorText(false);

    const dataFormatadaSalvar = format(data, "dd/MM/yyyy");
    const valorFinal = Number(valorFormatado.replace(/\D/g, "")) / 100;

    let itemData = {
      categoria,
      data: dataFormatadaSalvar,
      valor: valorFinal,
      descricao,
      type: type,
    };

    if (isRecipe) {
      if (categoria === "Alunos") {
        const nomeBase = alunoSelecionado?.nome || "Aluno Desconhecido";
        const matricula = alunoSelecionado?.matricula;
        const nomeCompleto = matricula
          ? `${nomeBase} (${matricula})`
          : nomeBase;
        itemData.nome = nomeCompleto;
        itemData.nome_aluno = nomeCompleto;
      } else {
        itemData.nome = nome;
      }
    } else {
      itemData.nome = nome;
    }

    onSave(itemData);
  };

  const renderReceitaForm = () => (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid item xs={12}>
        <FormControl
          fullWidth
          size="small"
          required
          error={!!errors.categoria}
          sx={blackFocusedTextFieldStyle}
        >
          <InputLabel id="categoria-label">Categoria</InputLabel>
          <Select
            labelId="categoria-label"
            value={categoria}
            label="Categoria"
            onChange={(e) => {
              setCategoria(e.target.value);
              // Limpa o aluno se mudar a categoria
              if(e.target.value !== "Alunos") setAlunoSelecionado(null);
            }}
          >
            <MenuItem value="" disabled>
              *Selecione uma categoria*
            </MenuItem>
            {categoriasReceita.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {categoria === "Alunos" && (
        <Grid item xs={12}>
          <Autocomplete
            fullWidth
            size="small"
            value={alunoSelecionado}
            onChange={(event, newValue) => setAlunoSelecionado(newValue)}
            inputValue={buscaAluno}
            onInputChange={(event, newInputValue) =>
              setBuscaAluno(newInputValue)
            }
            options={opcoesAlunos}
            getOptionLabel={(option) => {
              if (!option.nome) return "";
              return `${option.nome} ${option.matricula ? `(${option.matricula})` : ""}`;
            }}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id || option.matricula === value.matricula
            }
            loading={loadingAlunos}
            loadingText="Buscando alunos..."
            noOptionsText="Nenhum aluno encontrado"
            sx={blackFocusedTextFieldStyle}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecionar Aluno"
                required
                error={!!errors.aluno}
                sx={blackFocusedTextFieldStyle}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAlunos ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
      )}

      {categoria === "Outras" && (
        <Grid item xs={12}>
          <TextField
            autoFocus
            required
            error={!!errors.nome}
            id="nome"
            label="Nome da Receita"
            fullWidth
            size="small"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            sx={blackFocusedTextFieldStyle}
          />
        </Grid>
      )}

      <Grid item xs={12} sm={6}>
        <ThemeProvider theme={blackTheme}>
          <DatePicker
            label="Data"
            value={data}
            onChange={(newDate) => setData(newDate || new Date())}
            format="dd/MM/yyyy"
            disableFuture
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                required: true,
                error: !!errors.data,
              },
            }}
          />
        </ThemeProvider>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          required
          error={!!errors.valor}
          id="valor"
          label="Valor"
          fullWidth
          size="small"
          value={valorFormatado}
          onChange={handleValueChange}
          sx={blackFocusedTextFieldStyle}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          id="descricao"
          label="Descrição (Opcional)"
          fullWidth
          size="small"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          multiline
          rows={2}
          sx={blackFocusedTextFieldStyle}
        />
      </Grid>
    </Grid>
  );

  const renderDespesaForm = () => (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid item xs={12}>
        <TextField
          autoFocus
          required
          error={!!errors.nome}
          id="nome"
          label="Nome da Despesa"
          fullWidth
          size="small"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          sx={blackFocusedTextFieldStyle}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl
          fullWidth
          size="small"
          required
          error={!!errors.categoria}
          sx={blackFocusedTextFieldStyle}
        >
          <InputLabel id="categoria-label">Categoria</InputLabel>
          <Select
            labelId="categoria-label"
            value={categoria}
            label="Categoria"
            onChange={(e) => setCategoria(e.target.value)}
          >
            <MenuItem value="" disabled>
              *Selecione uma categoria*
            </MenuItem>
            {categoriasDespesa.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <ThemeProvider theme={blackTheme}>
          <DatePicker
            label="Data"
            value={data}
            onChange={(newDate) => setData(newDate || new Date())}
            format="dd/MM/yyyy"
            disableFuture
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                required: true,
                error: !!errors.data,
              },
            }}
          />
        </ThemeProvider>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          error={!!errors.valor}
          id="valor"
          label="Valor"
          fullWidth
          size="small"
          value={valorFormatado}
          onChange={handleValueChange}
          sx={blackFocusedTextFieldStyle}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="descricao"
          label="Descrição (Opcional)"
          fullWidth
          size="small"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          multiline
          rows={2}
          sx={blackFocusedTextFieldStyle}
        />
      </Grid>
    </Grid>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <ModalBase 
        open={open} 
        onClose={onClose} 
        title={title}
      >
        <DialogContent sx={{ pt: 1 }}>
          {showErrorText && (
            <Typography
              color="error"
              variant="body2"
              mb={1}
              textAlign="center"
              fontWeight="bold"
            >
              Por favor, preencha todos os campos obrigatórios.
            </Typography>
          )}
          {isRecipe ? renderReceitaForm() : renderDespesaForm()}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: "#343a40",
              color: "white",
              "&:hover": { backgroundColor: "#23272b" },
              fontWeight: "normal",
              textTransform: "uppercase",
            }}
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: "#F2D95C",
              color: "black",
              "&:hover": { backgroundColor: "#e0c850" },
              fontWeight: "normal",
              textTransform: "uppercase",
            }}
          >
            SALVAR
          </Button>
        </DialogActions>
      </ModalBase>
    </LocalizationProvider>
  );
}