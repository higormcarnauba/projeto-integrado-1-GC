import React, { useState, useEffect } from "react";
import {
  Box,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  FormLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ModalBase } from "../../../components/ModalBase";

export default function RenovarMensalidadeDialog({
  open,
  onClose,
  onRenovar,
  studentList = [],
}) {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setSearchTerm("");
        setFilteredStudents([]);
        setSelectedStudent(null);
      }, 300);
    }
  }, [open]);

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      const filtered = studentList.filter(
        (student) =>
          student.nome.toLowerCase().includes(term.toLowerCase()) ||
          String(student.matricula).includes(term)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const handleRenovar = () => {
    onRenovar(selectedStudent.matricula);
    onClose();
  };

  return (
    <ModalBase open={open} onClose={onClose} title="Renovar mensalidade">
      {step === 1 && (
        <>
          <DialogContent sx={{ pt: 1, pb: 0, px: 3 }}>
            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}
            >
              <TextField
                autoFocus
                placeholder="Pesquisar por nome ou matrícula"
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    { borderColor: "black" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    { borderColor: "#343a40" },
                }}
              />
              {filteredStudents.length > 0 && (
                <Paper sx={{ maxHeight: 200, overflow: "auto", mt: 1 }}>
                  <List dense>
                    {filteredStudents.map((student) => (
                      <ListItemButton
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                              {student.nome}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption">{`Matrícula: ${student.matricula}`}</Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "flex-end" }}>
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
          </DialogActions>
        </>
      )}

      {step === 2 && selectedStudent && (
        <>
          <DialogContent sx={{ pt: 1, pb: 0, px: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
              <Box
                sx={{
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "left",
                }}
              >
                <FormLabel sx={{ fontSize: "0.75rem", fontWeight: "normal" }}>
                  Data de expiração atual
                </FormLabel>
                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  {selectedStudent.data_expiracao || "-"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 1 }}>
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: "bold" }}>Aluno(A): </Box>
                  {selectedStudent.nome}
                </Typography>
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: "bold" }}>Matrícula: </Box>
                  {selectedStudent.matricula}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}>
            <Button
              onClick={() => setStep(1)}
              variant="contained"
              sx={{
                backgroundColor: "#343a40",
                color: "white",
                "&:hover": { backgroundColor: "#23272b" },
                fontWeight: "normal",
                textTransform: "none"
              }}
            >
              Voltar
            </Button>
            <Button
              onClick={handleRenovar}
              variant="contained"
              sx={{
                backgroundColor: "#F2D95C",
                color: "black",
                "&:hover": { backgroundColor: "#e0c850" },
                fontWeight: "normal",
                textTransform: "none"
              }}
            >
              Renovar + 30 dias
            </Button>
          </DialogActions>
        </>
      )}
    </ModalBase>
  );
}