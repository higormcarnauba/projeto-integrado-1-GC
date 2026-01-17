import React from "react";
import { Typography, Paper } from "@mui/material";

export default function SummaryCard({
  title,
  value,
  isGreen = false,
  isRed = false,
}) {
  const getTextColor = () => {
    if (isGreen) return "#2e7d32";
    if (isRed) return "#c62828";
    return "inherit";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ fontWeight: "bold" }}
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        component="p"
        sx={{
          fontWeight: "bold",
          color: getTextColor(),
          display: "flex",
          alignItems: "center",
        }}
      >
        {isGreen && (
          <span style={{ fontSize: "1.2rem", marginRight: 4 }}>▲</span>
        )}
        {isRed && <span style={{ fontSize: "1.2rem", marginRight: 4 }}>▼</span>}

        {value}
      </Typography>
    </Paper>
  );
}