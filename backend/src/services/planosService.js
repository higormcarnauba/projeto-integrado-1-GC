const repo = require("../repositories/planosRepository");
const { validatePlano } = require("../models/planos.model");

async function listAll() {
  return repo.findAll();
}

async function getByCod(cod_plano) {
  return repo.findByCod(cod_plano);
}

async function create(payload) {
  const duracaoCorrigida = payload.duracaoUnidade || payload.duracao_unidade || payload.tipoDuracao || payload.tipo_duracao;

  const planoParaDB = {
    nome_plano: payload.nome || payload.nome_plano,
    valor_plano: payload.valor || payload.valor_plano,
    status_plano: payload.status || payload.status_plano || 'Ativo',
        duracao_unidade: duracaoCorrigida, 
  };
  
  const { valid, errors } = validatePlano(planoParaDB);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }
  
  if (!planoParaDB.duracao_unidade) {
      const err = new Error("A Duração (Unidade) é obrigatória e não foi recebida.");
      err.status = 400;
      throw err;
  }

  return repo.create(planoParaDB);
}

async function update(cod_plano, payload) {
  const duracaoCorrigida = payload.duracaoUnidade || payload.duracao_unidade || payload.tipoDuracao || payload.tipo_duracao;

  const planoParaDB = {
    nome_plano: payload.nome || payload.nome_plano,
    valor_plano: payload.valor || payload.valor_plano,
    status_plano: payload.status || payload.status_plano,
    duracao_unidade: duracaoCorrigida,
  };

  const { valid, errors } = validatePlano(planoParaDB);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }

  return repo.update(cod_plano, planoParaDB);
}

async function remove(cod_plano) {
  return repo.remove(cod_plano);
}

module.exports = { listAll, getByCod, create, update, remove };