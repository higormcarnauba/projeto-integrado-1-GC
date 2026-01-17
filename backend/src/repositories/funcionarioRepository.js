const { pool } = require("../db");

const FIELDS = [
  "id_funcionario",
  "nome_funcionario",
  "email_funcionario",
  "cpf_funcionario",
  "senha",
  "nivel_acesso",
  "verificationcode",
  "verificationcodeexpiry",
  "passwordresetcode",
  "passwordresetexpiry",
  "isenabled",
  "deleted_at",
];

const FIELDS_SQL = FIELDS.join(", ");

function normalizeRole(r) {
  return String(r || "").toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

async function findAll() {
  const q = `SELECT ${FIELDS_SQL} FROM funcionarios WHERE deleted_at IS NULL ORDER BY id_funcionario`;
  const r = await pool.query(q);
  return r.rows;
}

async function findByCpf(cpf_funcionario) {
  const q = `SELECT ${FIELDS_SQL} FROM funcionarios WHERE cpf_funcionario = $1`;
  const r = await pool.query(q, [cpf_funcionario]);
  return r.rows[0] || null;
}

async function findByEmail(email_funcionario) {
  const q = `SELECT ${FIELDS_SQL} FROM funcionarios WHERE email_funcionario = $1`;
  const r = await pool.query(q, [email_funcionario]);
  return r.rows[0] || null;
}

async function findById(id_funcionario) {
  const q = `SELECT ${FIELDS_SQL} FROM funcionarios WHERE id_funcionario = $1`;
  const r = await pool.query(q, [id_funcionario]);
  return r.rows[0] || null;
}

async function create(funcionarios) {
  const cols = [];
  const placeholders = [];
  const vals = [];
  let idx = 1;

  const push = (col, val) => {
    cols.push(col);
    placeholders.push(`$${idx++}`);
    vals.push(val);
  };

  if (funcionarios.id_funcionario)
    push("id_funcionario", funcionarios.id_funcionario);
    push("nome_funcionario", funcionarios.nome_funcionario);
    push("email_funcionario", funcionarios.email_funcionario);
    push("cpf_funcionario", funcionarios.cpf_funcionario);
    push("senha", funcionarios.senha);
    push("nivel_acesso", funcionarios.nivel_acesso);

    push("verificationcode", funcionarios.verificationCode || null);
    push("verificationcodeexpiry", funcionarios.verificationCodeExpiry || null);
    push("passwordresetcode", funcionarios.passwordResetCode || null);
    push("passwordresetexpiry", funcionarios.passwordResetExpiry || null);
    push(
      "isenabled",
      funcionarios.isEnabled === undefined ? false : funcionarios.isEnabled
  );

  const q = `INSERT INTO funcionarios (${cols.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING ${FIELDS_SQL}`;
  try {
    const r = await pool.query(q, vals);
    return r.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("CPF ou Email já cadastrado!");
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

async function update(cpf_funcionario, dadosParaAtualizar) {
  const colunas = Object.keys(dadosParaAtualizar);
  const valores = Object.values(dadosParaAtualizar);

  if (colunas.length === 0) {
    return null;
  }

  const setClause = colunas
    .map((col, index) => `${col} = $${index + 1}`)
    .join(", ");

  const q = `UPDATE funcionarios SET ${setClause} WHERE cpf_funcionario = $${colunas.length + 1} RETURNING *`;

  try {
    const r = await pool.query(q, [...valores, cpf_funcionario]);
    return r.rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("CPF ou Email já cadastrado!");
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

async function remove(cpf_funcionario) {
  const q = `DELETE FROM funcionarios WHERE cpf_funcionario = $1 RETURNING cpf_funcionario`;
  const r = await pool.query(q, [cpf_funcionario]);
  return r.rows[0] || null;
}

async function updatePassword(id_funcionario, novaSenhaHash) {
  const q = `UPDATE funcionarios SET senha = $1 WHERE id_funcionario = $2 RETURNING id_funcionario`;
  const r = await pool.query(q, [novaSenhaHash, id_funcionario]);
  return r.rows[0] || null;
}

async function deleteAdminTransaction(requesterId, targetCpf, reason, validatePasswordFn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const requesterRes = await client.query(
      `SELECT * FROM funcionarios WHERE id_funcionario = $1 FOR UPDATE`,
      [requesterId]
    );
    const requester = requesterRes.rows[0];
    if (!requester) {
      const err = new Error('Solicitante não encontrado');
      err.status = 404;
      throw err;
    }

    const requesterRoleNorm = normalizeRole(requester.nivel_acesso);
    if (!requester.nivel_acesso || !['administrador', 'super_admin'].includes(requesterRoleNorm)) {
      const err = new Error('Permissão negada');
      err.status = 403;
      throw err;
    }

    const passwordValid = await validatePasswordFn(requester.senha);
    if (!passwordValid) {
      const err = new Error('Senha incorreta');
      err.status = 401;
      throw err;
    }

    const targetRes = await client.query(
      `SELECT * FROM funcionarios WHERE cpf_funcionario = $1 FOR UPDATE`,
      [targetCpf]
    );
    const target = targetRes.rows[0];
    if (!target) {
      const err = new Error('Usuário alvo não encontrado');
      err.status = 404;
      throw err;
    }

    if (target.nivel_acesso && normalizeRole(target.nivel_acesso) === 'super_admin') {
      const err = new Error('Não é possível excluir um Super-Admin');
      err.status = 403;
      throw err;
    }

    const countRes = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM funcionarios WHERE LOWER(nivel_acesso) = $1 AND deleted_at IS NULL`,
      ['administrador']
    );
    const adminCount = countRes.rows[0].cnt;

    if (target.id_funcionario === requester.id_funcionario) {
      if (normalizeRole(requester.nivel_acesso) !== 'administrador') {
        const err = new Error('Autoexclusão apenas disponível para administradores comuns');
        err.status = 400;
        throw err;
      }
      if (adminCount <= 1) {
        const err = new Error('Não é possível excluir o único administrador do sistema');
        err.status = 400;
        throw err;
      }
    }

    if (target.nivel_acesso && normalizeRole(target.nivel_acesso) === 'administrador' && target.id_funcionario !== requester.id_funcionario && adminCount <= 1) {
      const err = new Error('Não é possível excluir o único administrador do sistema');
      err.status = 400;
      throw err;
    }

    const delRes = await client.query(
      `DELETE FROM funcionarios WHERE cpf_funcionario = $1 RETURNING id_funcionario, cpf_funcionario, nome_funcionario`,
      [targetCpf]
    );
    const deletedRow = delRes.rows[0];

    await client.query(
      `INSERT INTO admin_deletions (target_id, target_cpf, performed_by, reason) VALUES ($1,$2,$3,$4)`,
      [
        deletedRow ? deletedRow.id_funcionario : null,
        target.cpf_funcionario, 
        requester.id_funcionario, 
        reason || 'Remoção permanente via painel administrativo'
      ]
    );

    await client.query('COMMIT');
    return { message: 'Usuário removido permanentemente com sucesso.' };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503') {
        const erroMsg = new Error('Não é possível excluir: O usuário possui registros vinculados (vendas, logs, etc).');
        erroMsg.status = 409;
        throw erroMsg;
    }
    throw err;
  } finally {
    client.release();
  }
}

async function activateAccount(id) {
  const q = `
    UPDATE funcionarios 
    SET isenabled = true, verificationcode = NULL, verificationcodeexpiry = NULL 
    WHERE id_funcionario = $1 
    RETURNING id_funcionario, email_funcionario
  `;
  const r = await pool.query(q, [id]);
  return r.rows[0];
}

module.exports = {
  findAll,
  findByCpf,
  findByEmail,
  findById,
  activateAccount,
  create,
  update,
  remove,
  updatePassword,
  deleteAdminTransaction
};