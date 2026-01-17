import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

const StatCard = ({ title, value, color }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      borderRadius: 3,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: '100%' 
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="h5" fontWeight="bold">
      <Typography
        component="span"
        variant="h5"
        fontWeight="bold"
        sx={{ color: color || 'inherit' }}
      >
        {value}
      </Typography>
    </Typography>
  </Paper>
);

export default function VisaoGeralPainel({
  receitasAlunos,
  outrasReceitas,
  despesas,
  resultado,
}) {
  const resultadoLimpo = String(resultado || "0").replace("R$ ", "").replace(".", "").replace(",", ".");
  const resultadoValor = parseFloat(resultadoLimpo);

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Receitas de alunos"
          value={receitasAlunos}
          color="green"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Outras receitas" 
          value={outrasReceitas} 
          color="green" 
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Despesas esse mês" 
          value={despesas} 
          color="#d32f2f" 
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Resultado no mês"
          value={resultado}
          color="black"
        />
      </Grid>
    </Grid>
  );
}