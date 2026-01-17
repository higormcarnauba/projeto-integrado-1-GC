const repo = require("../repositories/patrimonioRepository");
const { validatePatrimonio } = require("../models/patrimonio.model");

async function listAll() {
  return repo.findAll();
}

async function getById(id) {
  return repo.findById(id);
}

async function create(payload) {
  const { valid, errors } = validatePatrimonio(payload);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }

  return repo.create(payload);
}

async function update(id, payload) {
  const { valid, errors } = validatePatrimonio(payload);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }
  return repo.update(id, payload);
}

async function remove(id) {
  return repo.remove(id);
}

module.exports = { listAll, getById, create, update, remove };