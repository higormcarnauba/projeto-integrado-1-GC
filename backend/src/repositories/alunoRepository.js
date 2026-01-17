const { pool } = require("../db");

const SELECT_QUERY = `
    SELECT a.matricula, a.cod_plano, a.nome_aluno, a.email_aluno, a.cpf_aluno, 
        a.telefone, a.data_nascimento, a.logradouro, a.numero, a.status_aluno, 
        a.genero, a.created_at, a.data_expiracao, p.nome_plano
    FROM alunos a LEFT JOIN planos p ON a.cod_plano = p.cod_plano
`;

async function findAll() {
  const q = `${SELECT_QUERY} ORDER BY a.nome_aluno`;
  const r = await pool.query(q);
  return r.rows;
}

async function findByMatricula(matricula) {
  const q = `${SELECT_QUERY} WHERE a.matricula = $1`;
  const r = await pool.query(q, [matricula]);
  return r.rows[0] || null;
}

async function create(alunos, dataExpiracao, statusInicial) {
  const q = ` 
      INSERT INTO alunos (
          matricula, cod_plano, nome_aluno, email_aluno, cpf_aluno, 
          telefone, data_nascimento, logradouro, numero, 
          status_aluno, genero, data_inicio, data_expiracao
      )
      VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
          NOW(), 
          $12
      )
      RETURNING * `;

  const vals = [
    alunos.matricula, 
    alunos.cod_plano || null, 
    alunos.nome_aluno, 
    alunos.email_aluno, 
    alunos.cpf_aluno, 
    alunos.telefone, 
    alunos.data_nascimento, 
    alunos.logradouro, 
    alunos.numero, 
    statusInicial, 
    alunos.genero,
    dataExpiracao 
  ];

  try {
    const r = await pool.query(q, vals);
    return r.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("Matrícula, CPF ou Email já cadastrada!");
      err.status = 409;
      throw err;
    }
    console.error("Erro no Repository Create:", error); 
    throw error;
  }
}

async function updateRenovacao(matricula, cod_plano, novaDataExpiracao) {
    const q = `
        UPDATE alunos 
        SET cod_plano = $1, data_expiracao = $2, status_aluno = 'Ativo'
        WHERE matricula = $3
    `;
    await pool.query(q, [cod_plano, novaDataExpiracao, matricula]);
}

async function update(matricula, alunos) {
  const q = ` 
      UPDATE alunos SET 
          cod_plano=$1, nome_aluno=$2, email_aluno=$3, cpf_aluno=$4, telefone=$5, 
          data_nascimento=$6, logradouro=$7, numero=$8, status_aluno=$9, genero=$10
      WHERE matricula = $11 RETURNING * `;
  const vals = [
    alunos.cod_plano || null, alunos.nome_aluno, alunos.email_aluno, alunos.cpf_aluno, alunos.telefone,
    alunos.data_nascimento, alunos.logradouro, alunos.numero, alunos.status_aluno, alunos.genero,
    matricula,
  ];
  try {
    const r = await pool.query(q, vals);
    return r.rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("CPF ou Email já cadastrado!"); err.status = 409; throw err;
    }
    throw error;
  }
}

async function remove(matricula) {
  const q = ` DELETE FROM alunos WHERE matricula = $1 RETURNING matricula `;
  const r = await pool.query(q, [matricula]);
  return r.rows[0] || null;
}

async function updateStatus(matricula, status) {
    const q = ` UPDATE alunos SET status_aluno=$1 WHERE matricula = $2 RETURNING * `;
    const r = await pool.query(q, [status, matricula]);
    return r.rows[0] || null;
}

module.exports = { findAll, findByMatricula, create, update, remove, updateStatus, updateRenovacao };