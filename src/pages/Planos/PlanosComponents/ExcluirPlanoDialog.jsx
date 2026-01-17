import React from "react";
import { DialogActions, Button } from "@mui/material";
import { ModalBase } from "../../../components/ModalBase";

export function ExcluirPlanoDialog({ open, onClose, onConfirm, planToDelete }) {
  const modalTitle = `Tem certeza que deseja excluir o plano "${planToDelete?.nome_plano || planToDelete?.nome || ""}"?`;

  return (
    <ModalBase 
      open={open} 
      onClose={onClose} 
      title={modalTitle}
    >
      <DialogActions
        sx={{ px: 3, pb: 3, pt: 1, gap: 1, justifyContent: "flex-end" }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#343a40",
            color: "white",
            fontWeight: "normal",
            textTransform: "none",
            "&:hover": { backgroundColor: "#23272b" } 
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
            textTransform: "none",
            "&:hover": { backgroundColor: "#e0c850" }
          }}
        >
          Excluir
        </Button>
      </DialogActions>
    </ModalBase>
  );
}