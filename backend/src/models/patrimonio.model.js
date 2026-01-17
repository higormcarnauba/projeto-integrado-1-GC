const STATUSES = ['Ativo', 'Inativo', 'Em Manutenção'];

function validatePatrimonio(payload) {
  const errors = [];
  if (!payload) {
    errors.push('Payload is required');
    return { valid: false, errors };
  }

  if (!payload.nome || String(payload.nome).trim() === '') {
    errors.push('nome é obrigatório!');
  }

  if (!payload.data_aquisicao) {
    errors.push('data de aquisição é obrigatória!');
  } else {
    const d = new Date(payload.data_aquisicao);
    if (Number.isNaN(d.getTime())) errors.push('data de aquisição deve ser uma data válida');
    else if (d > new Date()) errors.push('data de aquisição não pode ser no futuro');
  }

  if (payload.status_patrimonio && !STATUSES.includes(String(payload.status_patrimonio))) {
    errors.push(`status de patrimônio deve ser um dos seguintes: ${STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { STATUSES, validatePatrimonio };