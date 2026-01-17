const express = require("express");
const router = express.Router();
const service = require("../services/alunoService");

router.get("/", async (req, res) => {
  try {
    const rows = await service.listAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao listar alunos" });
  }
});

router.get("/:matricula", async (req, res) => {
  try {
    const row = await service.getByMatricula(req.params.matricula);

    if (!row) return res.status(404).json({ error: "Aluno não encontrado" });

    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao obter aluno" });
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
    res.status(500).json({ error: "Falhou ao criar aluno" });
  }
});

router.put("/:matricula", async (req, res) => {
  try {
    const updated = await service.update(req.params.matricula, req.body);

    if (!updated)
      return res.status(404).json({ error: "Aluno não encontrado" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.status)
      return res
        .status(err.status)
        .json({ error: err.message, details: err.details });
    res.status(500).json({ error: "Falhou ao atualizar aluno" });
  }
});

router.delete("/:matricula", async (req, res) => {
  try {
    const removed = await service.remove(req.params.matricula);

    if (!removed)
      return res.status(404).json({ error: "Aluno não encontrado" });

    res.json({ removed: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao deletar aluno" });
  }
});

router.post('/renovar', async (req, res) => {
    try {
        const { matriculas, cod_plano } = req.body;
        await service.renew(matriculas, cod_plano);
        res.status(200).json({ message: "Renovação concluída!" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;