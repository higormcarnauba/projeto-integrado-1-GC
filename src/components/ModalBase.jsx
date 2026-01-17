import React from "react";
import { Dialog, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function ModalBase({ open, onClose, title, children }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: "100%",
          maxWidth: "500px",
          position: "relative",
        },
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.5rem",
            pt: 3,
            pb: 1,
          }}
        >
          {title}
        </DialogTitle>
      )}

      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      {children}
    </Dialog>
  );
}