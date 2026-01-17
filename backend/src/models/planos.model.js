const STATUSES = ['Ativo', 'Inativo'];
const DURACOES_PERMITIDAS = ['Diário', 'Mensal', 'Anual']; 

function validatePlano(payload) {
  const errors = [];
  if (!payload) {
    errors.push('Payload é obrigatório');
    return { valid: false, errors };
  }

  if (!payload.nome_plano || String(payload.nome_plano).trim() === '') {
    errors.push('Nome do Plano é obrigatório!');
  }

  const valor = parseFloat(payload.valor_plano);
  if (Number.isNaN(valor) || valor <= 0) {
    errors.push('Valor do Plano deve ser um número positivo!');
  }

  if (payload.status_plano && !STATUSES.includes(payload.status_plano)) {
    errors.push(`Status do Plano inválido! Valores permitidos: ${STATUSES.join(', ')}`);
  }
  
  if (!payload.duracao_unidade || !DURACOES_PERMITIDAS.includes(payload.duracao_unidade)) {
      errors.push(`Duração inválida! Valores permitidos: ${DURACOES_PERMITIDAS.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { STATUSES, validatePlano };