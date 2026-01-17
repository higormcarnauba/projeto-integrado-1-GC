const express = require("express");
const router = express.Router();
const service = require("../services/patrimonioService");

router.get("/", async (req, res) => {
  try {
    const rows = await service.listAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao listar patrimônio" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Não encontrado" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao obter patrimônio" });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    if (err.status)
      return res
        .status(err.status)
        .json({ error: err.message, details: err.details });
    res.status(500).json({ error: "Falhou ao criar patrimônio" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Não encontrado" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.status)
      return res
        .status(err.status)
        .json({ error: err.message, details: err.details });
    res.status(500).json({ error: "Falhou ao atualizar patrimônio" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removed = await service.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: "Não encontrado" });
    res.json({ removed: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao deletar patrimônio" });
  }
});

module.exports = router;