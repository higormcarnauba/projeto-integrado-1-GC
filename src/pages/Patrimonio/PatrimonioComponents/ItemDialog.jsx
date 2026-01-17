import React, { useState, useEffect } from "react";
import {
  Box,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ModalBase } from "../../../components/ModalBase";

const blackTheme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#000000",
            color: "#FFFFFF",
          },
          "&.Mui-selected": {
            backgroundColor: "#000000",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#333333",
            },
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
          "&.Mui-focused": {
            color: "#000000",
          },
          "&.Mui-error": {
            color: "red !important",
          },
          "&.Mui-disabled": {
            color: "rgba(0, 0, 0, 0.6)",
          },
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
}) {
  const [nome, setNome] = useState("");
  const [dataAquisicao, setDataAquisicao] = useState(null);
  const [status, setStatus] = useState("Ativo");
  const [codigo, setCodigo] = useState("");

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEditMode = !!itemToEdit;

  useEffect(() => {
    if (itemToEdit && open) {
      setNome(itemToEdit.nome || "");
      setCodigo(itemToEdit.codigo || itemToEdit.id_patrimonio || "");

      let initialDate = null;
      if (itemToEdit.data_aquisicao) {
        const parsedDate = new Date(itemToEdit.data_aquisicao);
        if (!isNaN(parsedDate.getTime())) {
          initialDate = parsedDate;
        }
      }
      setDataAquisicao(initialDate);

      const s = itemToEdit.status_patrimonio || itemToEdit.status || "";
      const sv = String(s).toLowerCase();
      if (sv === "ativo" || sv === "em uso") setStatus("Ativo");
      else if (sv === "inativo") setStatus("Inativo");
      else if (sv.includes("manut")) setStatus("Em Manutenção");
      else setStatus("Ativo");
    } else if (open) {
      setNome("");
      setCodigo("");
      setDataAquisicao(null);
      setStatus("Ativo");
    }
    setError(false);
    setErrorMessage("");
  }, [itemToEdit, open]);

  const handleSave = () => {
    setError(false);
    setErrorMessage("");

    const isNomeValid = nome.trim() !== "";
    const isDateValid = dataAquisicao !== null;

    if (!isNomeValid || !isDateValid) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      setError(true);
      return;
    }

    const formattedDate = dataAquisicao.toISOString().split("T")[0];
    const itemData = {
      nome,
      codigo: isEditMode ? codigo : undefined,
      data_aquisicao: formattedDate,
      status_patrimonio: status,
    };
    onSave(itemData);
    onClose();
  };

  return (
    <ModalBase 
      open={open} 
      onClose={onClose} 
      title={title}
    >
      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Typography
            color="error"
            variant="body2"
            mb={1}
            textAlign="center"
            fontWeight="bold"
          >
            {errorMessage}
          </Typography>
        )}
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <ThemeProvider theme={blackTheme}>
            <TextField
              autoFocus
              required
              id="nome"
              label="Nome do Item"
              fullWidth
              size="small"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={error && nome.trim() === ""}
            />

            {isEditMode && (
              <TextField
                id="codigo"
                label="Código (Não Editável)"
                fullWidth
                size="small"
                value={codigo}
                disabled={true}
              />
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Data de Aquisição *"
                value={dataAquisicao}
                onChange={(newValue) => setDataAquisicao(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    required: true,
                    error: error && dataAquisicao === null,
                  },
                }}
                disableFuture
              />
            </LocalizationProvider>
          </ThemeProvider>

          <FormControl>
            <FormLabel
              sx={{
                color: "#23272b",
                "&.Mui-focused": { color: "#23272b" },
                fontSize: "0.9rem"
              }}
            >
              Status:
            </FormLabel>
            <RadioGroup
              row
              name="status-group"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <FormControlLabel
                value="Ativo"
                control={
                  <Radio
                    size="small"
                    sx={{ "&.Mui-checked": { color: "#F2D95C" } }}
                  />
                }
                label="Ativo"
              />
              <FormControlLabel
                value="Em Manutenção"
                control={
                  <Radio
                    size="small"
                    sx={{ "&.Mui-checked": { color: "#F2D95C" } }}
                  />
                }
                label="Em Manutenção"
              />
              <FormControlLabel
                value="Inativo"
                control={
                  <Radio
                    size="small"
                    sx={{ "&.Mui-checked": { color: "#F2D95C" } }}
                  />
                }
                label="Inativo"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#343a40",
            color: "white",
            fontWeight: "normal",
            textTransform: "none",
            "&:hover": { backgroundColor: "#23272b" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: "#F2D95C",
            color: "black",
            fontWeight: "normal",
            textTransform: "none",
            "&:hover": { backgroundColor: "#e0c850" },
          }}
        >
          Salvar Item
        </Button>
      </DialogActions>
    </ModalBase>
  );
}