const repo = require("../repositories/financeiroRepository");
const alunoService = require('./alunoService');
const { validateFinanceiro } = require("../models/financeiro.model");

async function handleAlunoPayment(payload) {
    if (payload.tipo === 'Receita' && payload.categoria === 'Alunos') {
        const match = payload.nome.match(/\((.*?)\)$/);
        const matricula = match ? match[1] : null;

        if (matricula) {
            // Persistimos o status 'Ativo' imediatamente no BD após o pagamento.
            await alunoService.updateStatusByPayment(matricula, "Ativo");
        }
    }
}

async function listAll() {
  return await repo.findAll();
}

async function getById(id) {
  return await repo.findById(id);
}

async function create(payload) {
  const { valid, errors } = validateFinanceiro(payload);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }
  
  const created = await repo.create(payload);
  await handleAlunoPayment(payload);

  return created;
}

async function update(id, payload) {
  const { valid, errors } = validateFinanceiro(payload);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }
  
  const updated = await repo.update(id, payload);
  await handleAlunoPayment(payload);

  return updated;
}

async function remove(id) {
  return await repo.remove(id);
}

module.exports = { listAll, getById, create, update, remove };