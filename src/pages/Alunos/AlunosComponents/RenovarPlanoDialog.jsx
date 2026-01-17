import React, { useState } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { ModalBase } from "../../../components/ModalBase";

export default function RenovarPlanoDialog({
  open,
  onClose,
  onConfirm,
  listaPlanos,
}) {
  const [codPlano, setCodPlano] = useState("");

  const handleConfirm = () => {
    if (!codPlano) return;
    onConfirm(codPlano);
    setCodPlano("");
  };

  return (
    <ModalBase 
      open={open} 
      onClose={onClose} 
      title="Renovar Plano"
    >
      <DialogContent sx={{ pt: 1 }}>
        <Typography
          variant="body2"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Selecione o plano desejado para a renovação:
        </Typography>
        <FormControl 
          fullWidth 
          size="small"
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "black",
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "black" },
          }}
        >
          <InputLabel>Novo Plano</InputLabel>
          <Select
            value={codPlano}
            label="Novo Plano"
            onChange={(e) => setCodPlano(e.target.value)}
          >
            {listaPlanos.map((p) => (
              <MenuItem key={p.cod_plano} value={p.cod_plano}>
                {p.nome_plano} - R$ {parseFloat(p.valor_plano).toFixed(2)} /{" "}
                {p.duracao_unidade}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            textTransform: "none"
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{ 
            bgcolor: "#F2D95C", 
            color: "black",
            "&:hover": { backgroundColor: "#e0c850" },
            fontWeight: "normal",
            textTransform: "none"
          }}
          disabled={!codPlano}
        >
          Confirmar
        </Button>
      </DialogActions>
    </ModalBase>
  );
}