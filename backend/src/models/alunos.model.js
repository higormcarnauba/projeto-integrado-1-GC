const STATUSES = ["Ativo", "Inativo"];

function validateAluno(payload) {
  const errors = [];

  if (!payload) {
    errors.push("Payload is required");
    return { valid: false, errors };
  }

  if (!payload.matricula || String(payload.matricula).trim() === "") {
    errors.push("Matrícula é obrigatória!");
  }

  if (!payload.nome_aluno || String(payload.nome_aluno).trim() === "") {
    errors.push("Nome do aluno é obrigatório!");
  }

  if (!payload.email_aluno || String(payload.email_aluno).trim() === "") {
    errors.push("Email do aluno é obrigatório!");
  }

  if (!payload.data_nascimento) {
    errors.push("Data de nascimento é obrigatória!");
  } else {
    const dataNasc = new Date(payload.data_nascimento);

    if (Number.isNaN(dataNasc.getTime()))
      errors.push("Data de nascimento deve ser uma data válida!");
    else if (dataNasc > new Date()) {
      errors.push("Data de nascimento não pode ser uma data futura!");
    }
  }

  if (payload.status_aluno && !STATUSES.includes(payload.status_aluno)) {
    errors.push(`Status do aluno inválido! Valores permitidos: ${STATUSES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateAluno, STATUSES };