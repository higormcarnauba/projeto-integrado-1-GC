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
  Select,
  MenuItem,
  InputLabel,
  Typography,
} from "@mui/material";
import { ModalBase } from "../../../components/ModalBase";

const blackFocusedStyle = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "black",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#343a40",
  },
};

const errorTextFieldStyle = {
  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: "red !important",
  },
  "& .MuiInputLabel-root.Mui-error": { color: "red !important" },
};

const formatCurrency = (value) => {
  if (!value) return "";
  const numeric = value.replace(/\D/g, "");
  const number = Number(numeric) / 100;
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export function PlanoFormDialog({ open, onClose, onSave, title, planToEdit }) {
  const isEditMode = !!planToEdit;

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [valor, setValor] = useState("");
  const [valorFormatado, setValorFormatado] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [duracaoUnidade, setDuracaoUnidade] = useState("Mensal");

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (planToEdit && open) {
      setNome(planToEdit.nome || "");
      setCodigo(planToEdit.codigo || "");
      const raw = String(Math.round(parseFloat(planToEdit.valor) * 100));
      setValor(raw);
      setValorFormatado(formatCurrency(raw));
      setStatus(planToEdit.status || "Ativo");
      setDuracaoUnidade(
        planToEdit.duracaoUnidade || planToEdit.duracao_unidade || "Mensal"
      );
    } else {
      setNome("");
      setCodigo("");
      setValor("");
      setValorFormatado("");
      setStatus("Ativo");
      setDuracaoUnidade("Mensal");
    }
    setError(false);
    setErrorMessage("");
    setFieldErrors({});
  }, [planToEdit, open]);

  const handleValueChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 12) raw = raw.slice(0, 12);
    setValor(raw);
    setValorFormatado(formatCurrency(raw));
    setError(false);
  };

  const handleSave = () => {
    let errors = {};
    if (!nome.trim()) errors.nome = true;
    if (!valor.toString().trim()) errors.valor = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Preencha todos os campos.");
      setError(true);
      return;
    }

    const valorNumerico = Number(valor) / 100;
    if (valorNumerico <= 0) {
      setErrorMessage("Valor deve ser positivo.");
      setError(true);
      return;
    }

    const planoData = {
      id: planToEdit ? planToEdit.id : undefined,
      nome,
      codigo: isEditMode ? codigo : undefined,
      valor: valorNumerico,
      status: status,
      duracaoUnidade: duracaoUnidade,
    };

    onSave(planoData);
    onClose();
  };

  const getSx = (isError) => ({
    ...blackFocusedStyle,
    ...(isError && errorTextFieldStyle),
  });

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={title || (isEditMode ? "Editar Plano" : "Cadastrar Novo Plano")}
    >
      <DialogContent sx={{ px: 3, pt: 1 }}>
        {error && (
          <Typography color="error" variant="body2" mb={1} textAlign="center" fontWeight="bold">
            {errorMessage}
          </Typography>
        )}

        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            required
            label="Nome do Plano"
            fullWidth
            size="small"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={!!fieldErrors.nome}
            sx={getSx(!!fieldErrors.nome)}
          />
          {isEditMode && (
            <TextField
              label="Código"
              fullWidth
              size="small"
              value={codigo}
              disabled
            />
          )}
          <TextField
            required
            label="Valor"
            fullWidth
            size="small"
            value={valorFormatado}
            onChange={handleValueChange}
            error={!!fieldErrors.valor}
            sx={getSx(!!fieldErrors.valor)}
          />

          <FormControl required size="small" fullWidth sx={blackFocusedStyle}>
            <InputLabel>Duração</InputLabel>
            <Select
              value={duracaoUnidade}
              label="Duração"
              onChange={(e) => setDuracaoUnidade(e.target.value)}
            >
              <MenuItem value="Diário">Diário</MenuItem>
              <MenuItem value="Mensal">Mensal</MenuItem>
              <MenuItem value="Anual">Anual</MenuItem>
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ color: "#23272b", fontSize: "0.9rem", mb: 0.5 }}
            >
              Status:
            </FormLabel>
            <RadioGroup
              row
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <FormControlLabel
                value="Ativo"
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: "#F2D95C" } }} />}
                label="Ativo"
              />
              <FormControlLabel
                value="Inativo"
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: "#F2D95C" } }} />}
                label="Inativo"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}>
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
          Salvar
        </Button>
      </DialogActions>
    </ModalBase>
  );
}