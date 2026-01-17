const express = require("express");
const router = express.Router();
const service = require("../services/funcionarioService");

router.get("/", async (req, res) => {
  try {
    const rows = await service.listAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao listar funcionarios" });
  }
});

router.get("/id/:id", async (req, res) => {
  try {
    const row = await service.getById(req.params.id);
    if (!row)
      return res.status(404).json({ error: "Funcionario não encontrado" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao obter funcionario por ID" });
  }
});

router.get("/:cpf_funcionario", async (req, res) => {
  try {
    const row = await service.getByCpf(req.params.cpf_funcionario);

    if (!row)
      return res.status(404).json({ error: "Funcionario não encontrado" });

    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao obter funcionario" });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await service.create(req.body);
    const { senha, ...safe } = created || {};
    res.status(201).json(safe);
  } catch (err) {
    console.error(err);
    if (err.status)
      return res
        .status(err.status)
        .json({ error: err.message, details: err.details });
    res.status(500).json({ error: "Falhou ao criar funcionario" });
  }
});

router.post('/verify-account', async (req, res) => {
  try {
    const { id, code } = req.body;
    
    if (!id || !code) {
      return res.status(400).json({ error: 'ID e Código são obrigatórios' });
    }

    const result = await service.verifyAccountCreation(id, code);
    res.json(result);
  } catch (err) {
    console.error('Erro na verificação de conta:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

router.put("/alterar-senha/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    await service.changePassword(id, senhaAtual, novaSenha);

    res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    console.error("Erro rota senha:", err);
    const status = err.status || 500;
    res
      .status(status)
      .json({ error: err.message || "Falhou ao alterar senha" });
  }
});

router.put("/:cpf_funcionario", async (req, res) => {
  try {
    const updated = await service.update(req.params.cpf_funcionario, req.body);

    if (!updated)
      return res.status(404).json({ error: "Funcionario não encontrado" });
    
    const { senha, ...safe } = updated || {};
    res.json(safe);
  } catch (err) {
    console.error(err);
    if (err.status)
      return res
        .status(err.status)
        .json({ error: err.message, details: err.details });
    res.status(500).json({ error: "Falhou ao atualizar funcionário" });
  }
});

router.delete("/:cpf_funcionario", async (req, res) => {
  try {
    const removed = await service.remove(req.params.cpf_funcionario);

    if (!removed)
      return res.status(404).json({ error: "Funcionario não encontrado" });

    res.json({ removed: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falhou ao deletar funcionario" });
  }
});

router.post('/email/change/initiate', async (req, res) => {
  try {
    const { id, currentPassword, newEmail } = req.body;
    if (!id || !currentPassword || !newEmail) {
      return res.status(400).json({ error: 'id, currentPassword e newEmail são obrigatórios' });
    }

    const result = await service.initiateEmailChange(id, currentPassword, newEmail);
    res.json(result);
  } catch (err) {
    console.error('Erro ao iniciar alteração de email:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/email/change/verify', async (req, res) => {
  try {
    const { id, code } = req.body;
    if (!id || !code) {
      return res.status(400).json({ error: 'id e code são obrigatórios' });
    }

    const result = await service.verifyEmailChange(id, code);
    res.json(result);
  } catch (err) {
    console.error('Erro ao verificar alteração de email:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/admin/delete', async (req, res) => {
  try {
    const { requesterId, targetCpf, adminPassword, reason } = req.body;
    
    if (!requesterId || !targetCpf || !adminPassword) {
      return res.status(400).json({ error: 'requesterId, targetCpf e adminPassword são obrigatórios' });
    }

    const result = await service.deleteAdmin(requesterId, targetCpf, adminPassword, reason);
    res.json(result);
  } catch (err) {
    console.error('Erro ao demitir admin:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;