import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function MenuRelatorios({
  onDownloadBalancete,
  onDownloadReceitasAlunos,
  onDownloadOutrasReceitas,
  onDownloadTodasReceitas,
  onDownloadTodasDespesas,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (action) => {
    if (action) {
      action();
    }
    handleClose();
  };

  const blackFocusedTextFieldStyle = {
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

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          color: "text.secondary",
          borderColor: "grey.400",
          fontWeight: "normal",
          borderRadius: "25px",
          textTransform: "uppercase",
          "&:hover": {
            borderColor: "black",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            color: "black",
          },

          "&.Mui-focusVisible": {
            borderColor: "black",
            boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        Relatórios
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          disabled
          sx={{
            opacity: "1 !important",
            fontSize: "0.8rem",
            color: "text.secondary",
          }}
        >
          <Typography variant="caption">
            Ajuste o período no calendário antes de emitir o relatório.
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => handleSelect(onDownloadBalancete)}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          Demonstrativo contábil do mês
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => handleSelect(onDownloadReceitasAlunos)}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          Receitas de alunos
        </MenuItem>
        <MenuItem onClick={() => handleSelect(onDownloadOutrasReceitas)}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          Outras receitas
        </MenuItem>
        <MenuItem onClick={() => handleSelect(onDownloadTodasReceitas)}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          Todas as receitas
        </MenuItem>
        <MenuItem onClick={() => handleSelect(onDownloadTodasDespesas)}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          Todas as despesas
        </MenuItem>
      </Menu>
    </>
  );
}