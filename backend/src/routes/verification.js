const express = require('express');
const router = express.Router();
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

module.exports = router;