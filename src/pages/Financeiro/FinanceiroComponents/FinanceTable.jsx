import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Collapse,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function RowDetails({ item, isRecipe }) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "#fafafa",
        borderRadius: 1,
        border: "1px solid #eee",
        m: 1,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textTransform: "uppercase" }}
          >
            Descrição
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {item.descricao || "Não informado"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

function RowItem({ row, isRecipe, onEdit, onDelete, isAdmin, columns }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
        }}
      >
        {columns.map((column) => {
          const value = row[column.id];

          return (
            <TableCell
              key={column.id}
              align={column.align || "left"}
              padding="none"
              sx={{
                py: 1.5,
                borderBottom: "1px solid #eee",
                px: column.id === "expand" ? 1 : 2,
                width: column.width,
              }}
            >
              {column.id === "expand" ? (
                <Box sx={{ textAlign: "center" }}>
                  <IconButton
                    size="small"
                    onClick={() => setOpen(!open)}
                    sx={{ p: 0.5 }}
                  >
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </Box>
              ) : column.id === "valor" ? (
                `R$ ${value.toFixed(2).replace(".", ",")}`
              ) : column.id === "acao" ? (
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    justifyContent: "center",
                    minHeight: "34px",
                  }}
                >
                  {isAdmin && (
                    <>
                      <IconButton
                        size="small"
                        sx={{ color: "#6f7174ff" }}
                        onClick={() => onEdit(row, isRecipe)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#6f7174ff" }}
                        onClick={() => onDelete(row.id, isRecipe)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>
              ) : (
                value
              )}
            </TableCell>
          );
        })}
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={columns.length}
          sx={{
            py: 0,
            px: 0,
            borderBottom: "1px solid #eee",
          }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <RowDetails item={row} isRecipe={isRecipe} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function FinanceTable({
  title,
  rows,
  isRecipe,
  page,
  rowsPerPage,
  count,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  isAdmin,
}) {
  const columns = useMemo(() => {
    const baseColumns = [
      { id: "expand", label: "", width: "5%" },
      { id: "id", label: "ID", width: "10%" },
      { id: "nome", label: "Nome", width: "25%" },
      { id: "categoria", label: "Categoria", width: "20%" },
      { id: "data", label: "Data", width: "15%", align: "left" },
      { id: "valor", label: "Valor", width: "15%" },
    ];

    if (isAdmin) {
      return [
        ...baseColumns,
        { id: "acao", label: "Ação", align: "center", width: "10%" },
      ];
    }
    return baseColumns;
  }, [isAdmin]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexGrow: 1,
        }}
      >
        <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
          <Table stickyHeader sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    padding="none"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#fff",
                      py: 1.5,
                      px: column.id === "expand" ? 1 : 2,
                      width: column.width,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <RowItem
                    key={row.id}
                    row={row}
                    isRecipe={isRecipe}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isAdmin={isAdmin}
                    columns={columns}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={count}
          component="div"
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{
            borderTop: "1px solid #eee",
            backgroundColor: "#fff",
          }}
          labelRowsPerPage="Itens por pág:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />
      </Paper>
    </Box>
  );
}