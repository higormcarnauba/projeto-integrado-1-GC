function validateFinanceiro(data) {
    const errors = [];

    if (!data.nome || data.nome.trim() === '') {
        errors.push("O nome/título é obrigatório.");
    }
    
    if (!data.tipo || (data.tipo !== 'Receita' && data.tipo !== 'Despesa')) {
        errors.push("O tipo deve ser 'Receita' ou 'Despesa'.");
    }

    if (!data.valor || isNaN(data.valor) || Number(data.valor) <= 0) {
        errors.push("O valor deve ser um número positivo.");
    }

    if (!data.data) {
        errors.push("A data é obrigatória.");
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = { validateFinanceiro };