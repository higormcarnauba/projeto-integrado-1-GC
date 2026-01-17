import React from "react";
import {
  DialogActions,
  Button,
  DialogContent,
  Typography,
  Box,
} from "@mui/material";
import { ModalBase } from "../../../components/ModalBase";

export default function ExcluirAlunoDialog({
  open,
  onClose,
  onConfirm,
  alunoParaExcluir,
}) {
  const nome = alunoParaExcluir ? alunoParaExcluir.nome : "...";
  const matricula = alunoParaExcluir ? alunoParaExcluir.matricula : "...";

  return (
    <ModalBase 
      open={open} 
      onClose={onClose} 
      title="Tem certeza que deseja excluir esse aluno?"
    >
      <DialogContent sx={{ px: 3, pt: 1, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2.0,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1">
            <Box component="span" sx={{ fontWeight: "bold" }}>
              Aluno(A):{" "}
            </Box>
            {nome}
          </Typography>
          <Typography variant="body1">
            <Box component="span" sx={{ fontWeight: "bold" }}>
              Matrícula:{" "}
            </Box>
            {matricula}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#343a40",
            color: "#ffffff",
            fontWeight: "normal",
            "&:hover": { backgroundColor: "#23272b" },
          }}
        >
          Voltar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: "#F2D95C",
            color: "black",
            fontWeight: "normal",
            "&:hover": { backgroundColor: "#e0c850" },
          }}
        >
          Excluir
        </Button>
      </DialogActions>
    </ModalBase>
  );
}