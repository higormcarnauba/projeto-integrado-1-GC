import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const formatCPF = (value) => {
  const numeric = value.replace(/\D/g, "");
  return numeric
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);
};

const formatTelefone = (value) => {
  const numeric = value.replace(/\D/g, "");
  return numeric
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2")
    .substring(0, 16);
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidCPF = (cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
const isValidTelefone = (tel) => {
  const clean = tel.replace(/\D/g, "");
  return clean.length >= 10;
};

const blackTheme = createTheme({
  palette: { primary: { main: "#000000" } },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
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
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": { color: "#000000" },
          "&.Mui-error": { color: "red !important" },
        },
      },
    },
  },
});

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

export default function EditarAlunoDialog({
  open,
  onClose,
  onSave,
  alunoParaEditar,
  listaPlanos = [],
}) {
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState(null);
  const [email, setEmail] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairroComplemento, setBairroComplemento] = useState("");
  const [numero, setNumero] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataInicio, setDataInicio] = useState(null);
  const [plano, setPlano] = useState("");
  const [genero, setGenero] = useState("prefiro");

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (alunoParaEditar) {
      setNome(alunoParaEditar.nome || "");

      const p = alunoParaEditar.cod_plano || "";
      setPlano(p);

      setGenero(alunoParaEditar.genero || "prefiro");
      setEmail(alunoParaEditar.email || "");

      const logradouroBD = alunoParaEditar.endereco?.logradouro || "";
      const partes = logradouroBD
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      let logradouroInicial = "";
      let bairroComplementoInicial = "";
      if (partes.length >= 2) {
        logradouroInicial = partes[0];
        bairroComplementoInicial = partes[1];
      } else if (partes.length === 1) {
        bairroComplementoInicial = partes[0];
      }
      setLogradouro(logradouroInicial);
      setBairroComplemento(bairroComplementoInicial);
      setNumero(alunoParaEditar.endereco?.numero || "");
      setTelefone(alunoParaEditar.telefone || "");
      setCpf(alunoParaEditar.cpf || "");

      const parseDate = (dateString) => {
        if (!dateString) return null;
        if (dateString instanceof Date) return dateString;
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) return d;
        if (typeof dateString === "string" && dateString.includes("/")) {
          const parts = dateString.split("/");
          if (parts.length === 3)
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        return null;
      };

      setDataNascimento(parseDate(alunoParaEditar.dataNascimento));
      setDataInicio(
        parseDate(alunoParaEditar.data_matricula || alunoParaEditar.dataInicio)
      );
    } else {
      setNome("");
      setDataNascimento(null);
      setEmail("");
      setLogradouro("");
      setBairroComplemento("");
      setNumero("");
      setTelefone("");
      setCpf("");
      setDataInicio(null);
      setPlano("");
      setGenero("prefiro");
    }
    setError(false);
    setErrorMessage("");
    setFieldErrors({});
  }, [alunoParaEditar, open]);

  const handleCpfChange = (e) => {
    setCpf(formatCPF(e.target.value));
    if (fieldErrors.cpf) setFieldErrors((prev) => ({ ...prev, cpf: false }));
  };
  const handleTelefoneChange = (e) => {
    setTelefone(formatTelefone(e.target.value));
    if (fieldErrors.telefone)
      setFieldErrors((prev) => ({ ...prev, telefone: false }));
  };
  const handleChangeGeneric = (setter, field) => (e) => {
    setter(e.target.value);
    if (fieldErrors[field])
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSave = () => {
    setError(false);
    setErrorMessage("");
    let errors = {};

    if (!nome.trim()) errors.nome = true;
    if (!email.trim()) errors.email = true;
    if (!cpf.trim()) errors.cpf = true;
    if (!dataNascimento) errors.dataNascimento = true;
    if (!dataInicio) errors.dataInicio = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Preencha todos os campos obrigatórios.");
      setError(true);
      return;
    }

    let specificErrors = {};
    if (!isValidEmail(email)) specificErrors.email = true;
    if (!isValidCPF(cpf)) specificErrors.cpf = true;
    if (telefone.length > 0 && !isValidTelefone(telefone))
      specificErrors.telefone = true;

    if (Object.keys(specificErrors).length > 0) {
      setFieldErrors(specificErrors);
      setErrorMessage("Verifique os campos em vermelho (formato inválido).");
      setError(true);
      return;
    }

    let logradouroFinal = null;
    const logradouroClean = logradouro.trim();
    const bairroComplementoClean = bairroComplemento.trim();

    if (logradouroClean && bairroComplementoClean) {
      logradouroFinal = `${logradouroClean}, ${bairroComplementoClean}`;
    } else if (logradouroClean) {
      logradouroFinal = logradouroClean;
    } else if (bairroComplementoClean) {
      logradouroFinal = bairroComplementoClean;
    }

    const alunoEditado = {
      id: alunoParaEditar.id,
      matricula: alunoParaEditar.matricula,
      nome,
      email,
      cpf,
      telefone,
      dataNascimento,
      dataInicio,
      logradouro: logradouroFinal,
      numero,
      cod_plano: plano,
      genero,
      status: alunoParaEditar.status,
    };

    onSave(alunoEditado);
    onClose();
  };

  const getSx = (fieldName) => ({
    ...blackFocusedStyle,
    ...(fieldErrors[fieldName] && errorTextFieldStyle),
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus={true}
      keepMounted={false}
      PaperProps={{ sx: { borderRadius: 2, maxHeight: "550px" } }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          pt: 2,
          pb: 0.5,
          px: 3,
        }}
      >
        Editar Aluno
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 1,
          pb: 0,
          "&::-webkit-scrollbar": { width: "0.4em" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,.15)",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0,0,0,.3)",
          },
        }}
      >
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
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
            Informações Pessoais:
          </Typography>
          <TextField
            required
            label="Nome Completo"
            size="small"
            value={nome}
            onChange={handleChangeGeneric(setNome, "nome")}
            error={!!fieldErrors.nome}
            sx={getSx("nome")}
          />
          <ThemeProvider theme={blackTheme}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <DatePicker
                label="Data de Nascimento *"
                value={dataNascimento}
                onChange={(newValue) => setDataNascimento(newValue)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    error: !!fieldErrors.dataNascimento,
                    sx: fieldErrors.dataNascimento ? errorTextFieldStyle : {},
                  },
                }}
                disableFuture
              />
            </LocalizationProvider>
          </ThemeProvider>
          <TextField
            required
            label="E-mail"
            size="small"
            placeholder="email@exemplo.com"
            value={email}
            onChange={handleChangeGeneric(setEmail, "email")}
            error={!!fieldErrors.email}
            sx={getSx("email")}
          />
          <TextField
            required
            label="CPF"
            size="small"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            inputProps={{ maxLength: 14 }}
            error={!!fieldErrors.cpf}
            sx={getSx("cpf")}
          />
          <TextField
            label="Telefone"
            size="small"
            placeholder="(DDD) 9 9999-9999"
            value={telefone}
            onChange={handleTelefoneChange}
            inputProps={{ maxLength: 16 }}
            error={!!fieldErrors.telefone}
            sx={getSx("telefone")}
          />

          <Typography variant="subtitle1" sx={{ fontWeight: "bold", pt: 1 }}>
            Endereço:{" "}
            <Typography component="span" color="text.secondary">
              (opcional)
            </Typography>
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Endereço"
              size="small"
              placeholder="Rua, Av..."
              fullWidth
              value={logradouro}
              onChange={handleChangeGeneric(setLogradouro, "logradouro")}
              sx={getSx("logradouro")}
            />
            <TextField
              label="Nº"
              size="small"
              placeholder="123"
              sx={{ width: "80px", ...getSx("numero") }}
              value={numero}
              onChange={handleChangeGeneric(setNumero, "numero")}
            />
          </Box>
          <TextField
            label="Bairro"
            size="small"
            value={bairroComplemento}
            onChange={handleChangeGeneric(
              setBairroComplemento,
              "bairroComplemento"
            )}
            sx={getSx("bairroComplemento")}
          />

          <Typography variant="subtitle1" sx={{ fontWeight: "bold", pt: 1 }}>
            Informações Administrativas:
          </Typography>
          <ThemeProvider theme={blackTheme}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <DatePicker
                label="Data de início *"
                value={dataInicio}
                onChange={(newValue) => setDataInicio(newValue)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    error: !!fieldErrors.dataInicio,
                    sx: fieldErrors.dataInicio ? errorTextFieldStyle : {},
                  },
                }}
                disabled={true}
                disableFuture
              />
            </LocalizationProvider>
          </ThemeProvider>

          <FormControl fullWidth size="small" disabled>
            <InputLabel
              id="edit-plano-select-label"
              sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}
            >
              Plano
            </InputLabel>
            <Select
              labelId="edit-plano-select-label"
              value={plano}
              label="Plano"
              onChange={(e) => setPlano(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Sem Plano</em>
              </MenuItem>
              {listaPlanos.map((p) => (
                <MenuItem key={p.cod_plano} value={p.cod_plano}>
                  {p.nome_plano} - R$ {parseFloat(p.valor_plano).toFixed(2)}
                </MenuItem>
              ))}
            </Select>
            <Typography
              variant="caption"
              sx={{ mt: 0.5, color: "text.secondary", fontSize: "0.7rem" }}
            >
              Para alterar o plano, utilize a opção "Renovar" na tabela.
            </Typography>
          </FormControl>

          <FormControl sx={{ pt: 1, pb: 1 }}>
            <FormLabel
              sx={{ color: "#23272b", "&.Mui-focused": { color: "#23272b" } }}
            >
              Gênero:
            </FormLabel>
            <RadioGroup
              row
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
            >
              <FormControlLabel
                value="masculino"
                control={
                  <Radio
                    size="small"
                    sx={{ "&.Mui-checked": { color: "#F2D95C" } }}
                  />
                }
                label={<Typography variant="body2">Masculino</Typography>}
              />
              <FormControlLabel
                value="feminino"
                control={
                  <Radio
                    size="small"
                    sx={{ "&.Mui-checked": { color: "#F2D95C" } }}
                  />
                }
                label={<Typography variant="body2">Feminino</Typography>}
              />
              <FormControlLabel
                value="prefiro"
                control={
                  <Radio
                    size="small"
                    sx={{ "&.Mui-checked": { color: "#F2D95C" } }}
                  />
                }
                label={
                  <Typography variant="body2">Prefiro não informar</Typography>
                }
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
            "&:hover": { backgroundColor: "#23272b" },
            fontWeight: "normal",
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
            "&:hover": { backgroundColor: "#e0c850" },
            fontWeight: "normal",
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}