const { pool } = require("../db");

async function findAll() {
  const q =
    "SELECT id_patrimonio, nome, status_patrimonio, data_aquisicao, created_at FROM patrimonio ORDER BY id_patrimonio";
  const r = await pool.query(q);
  return r.rows;
}

async function findById(id) {
  const q =
    "SELECT id_patrimonio, nome, status_patrimonio, data_aquisicao, created_at FROM patrimonio WHERE id_patrimonio = $1";
  const r = await pool.query(q, [id]);
  return r.rows[0] || null;
}

async function create(p) {
  const q = `INSERT INTO patrimonio (nome, status_patrimonio, data_aquisicao) VALUES ($1,$2,$3) RETURNING id_patrimonio, nome, status_patrimonio, data_aquisicao, created_at`;
  const vals = [p.nome, p.status_patrimonio || "Ativo", p.data_aquisicao];
  const r = await pool.query(q, vals);
  return r.rows[0];
}

async function update(id, p) {
  const q = `UPDATE patrimonio SET nome = $1, status_patrimonio = $2, data_aquisicao = $3 WHERE id_patrimonio = $4 RETURNING id_patrimonio, nome, status_patrimonio, data_aquisicao, created_at`;
  const vals = [p.nome, p.status_patrimonio, p.data_aquisicao, id];
  const r = await pool.query(q, vals);
  return r.rows[0] || null;
}

async function remove(id) {
  const q =
    "DELETE FROM patrimonio WHERE id_patrimonio = $1 RETURNING id_patrimonio";
  const r = await pool.query(q, [id]);
  return r.rows[0] || null;
}

module.exports = { findAll, findById, create, update, remove };