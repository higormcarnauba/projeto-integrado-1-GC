const { pool } = require("../db");

const FIELDS = [
  "cod_plano",
  "nome_plano",
  "valor_plano",
  "status_plano",
  "created_at",
  "duracao_unidade", 
];

async function findAll() {
  const q = `SELECT ${FIELDS.join(", ")} FROM planos ORDER BY cod_plano`;
  const r = await pool.query(q);
  return r.rows;
}

async function findByCod(cod_plano) {
  const q = `SELECT ${FIELDS.join(", ")} FROM planos WHERE cod_plano = $1`;
  const r = await pool.query(q, [cod_plano]);
  return r.rows[0] || null;
}

async function create(plano) {
  const q = `
        INSERT INTO planos (nome_plano, valor_plano, status_plano, duracao_unidade)
        VALUES ($1, $2, $3, $4)
        RETURNING ${FIELDS.join(", ")}
    `;

  const vals = [
    plano.nome_plano,
    plano.valor_plano,
    plano.status_plano || "Ativo",
    plano.duracao_unidade, 
  ];

  try {
    const r = await pool.query(q, vals);
    return r.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("Nome do Plano já cadastrado!");
      err.status = 409;
      throw err;
    }
    console.error("Erro no DB Create Plano:", error);
    throw error;
  }
}

async function update(cod_plano, plano) {
  const q = `
        UPDATE planos 
        SET nome_plano = $1, valor_plano = $2, status_plano = $3, duracao_unidade = $4
        WHERE cod_plano = $5 
        RETURNING ${FIELDS.join(", ")}
    `;

  const vals = [
    plano.nome_plano,
    plano.valor_plano,
    plano.status_plano,
    plano.duracao_unidade,
    cod_plano,
  ];

  try {
    const r = await pool.query(q, vals);
    return r.rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("Nome do Plano já cadastrado!");
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

async function remove(cod_plano) {
  const q = `DELETE FROM planos WHERE cod_plano = $1 RETURNING cod_plano`;

  try {
    const r = await pool.query(q, [cod_plano]);
    return r.rows[0] || null;
  } catch (error) {
    if (error.code === "23503") {
      const err = new Error(
        "Não é possível excluir este plano pois existem alunos vinculados a ele."
      );
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

module.exports = { findAll, findByCod, create, update, remove };