const express = require("express");
const router = express.Router();
const service = require('../services/financeiroService');
const emailService = require('../services/emailService');

router.post('/verify', async (req, res) => {
  try {
    console.log('[verify route] body:', req.body);
    const { cpf_funcionario, code } = req.body;
    
    if (!cpf_funcionario || !code) {
      return res.status(400).json({ error: 'cpf_funcionario e code são obrigatórios' });
    }

    const result = await emailService.verifyEmail(cpf_funcionario, code);
    res.json(result);
  } catch (err) {
    console.error('Erro na verificação de email:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/resend-code', async (req, res) => {
  try {
    const { cpf_funcionario } = req.body;
    if (!cpf_funcionario) {
        return res.status(400).json({ error: 'CPF é obrigatório.' });
    }
    
    await emailService.sendVerificationCode(cpf_funcionario);
    
    res.json({ message: 'Código reenviado com sucesso.' });
  } catch (err) {
    console.error('Erro ao reenviar código:', err);
    res.status(500).json({ error: 'Erro ao reenviar código.' });
  }
});

router.get("/", async (req, res) => {
  try {
    const rows = await service.listAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao listar financeiro" });
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
    res.status(500).json({ error: "Falha ao criar registro financeiro" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated)
      return res.status(404).json({ error: "Registro não encontrado" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.status)
      return res
        .status(err.status)
        .json({ error: err.message, details: err.details });
    res.status(500).json({ error: "Falha ao atualizar registro" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removed = await service.remove(req.params.id);
    if (!removed)
      return res.status(404).json({ error: "Registro não encontrado" });
    res.json({ removed: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao deletar registro" });
  }
});

module.exports = router;