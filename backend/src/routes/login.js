const express = require("express");
const router = express.Router();

const loginService = require("../services/loginService");

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginService.authenticate(email, password);
    res.json(result);
  } catch (err) {
    console.error("Login error:", err.message || err);
    if (err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;