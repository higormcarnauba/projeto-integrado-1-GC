const STATUSES = ["Administrador", "Funcionário", "Funcionario", "Super Admin", "Super-Admin", "Super_Admin"];

function validateFuncionario(payload) {
  const errors = [];

  if (!payload) {
    errors.push("Payload is required");
    return { valid: false, errors };
  }

  if (!payload.nome_funcionario || String(payload.nome_funcionario).trim() === "") {
    errors.push("Nome do funcionário é obrigatório!");
  }

  if (!payload.email_funcionario || String(payload.email_funcionario).trim() === "") {
    errors.push("Email do funcionário é obrigatório!");
  }

  if (!payload.senha || String(payload.senha).trim() === "") {
    errors.push("Senha do funcionário é obrigatória!");
  }

  if (!payload.nivel_acesso || String(payload.nivel_acesso).trim() === "") {
    errors.push("Nível de acesso é obrigatório!");
  }

  if (payload.nivel_acesso && !STATUSES.includes(payload.nivel_acesso)) {
    errors.push("Nível de acesso inválido!");
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateFuncionario, STATUSES };