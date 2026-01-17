const repo = require("../repositories/funcionarioRepository");
const { validateFuncionario } = require("../models/funcionarios.model");
const bcrypt = require("bcrypt");
const emailService = require("./emailService");

const CODE_EXPIRY_MINUTES = 60;
const generate6Digit = () =>
  String(Math.floor(100000 + Math.random() * 900000));

async function listAll() {
  return repo.findAll();
}

async function getByCpf(cpf_funcionario) {
  return repo.findByCpf(cpf_funcionario);
}

async function getById(id) {
  return repo.findById(id);
}

async function create(payload) {
  const { valid, errors } = validateFuncionario(payload);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }

  const existingFuncionario = await repo.findByCpf(payload.cpf_funcionario);
  if (existingFuncionario) {
    const err = new Error("Funcionário com este CPF já existe");
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(String(payload.senha), 10);

  const verificationCode = generate6Digit();
  const expiresAt = new Date(Date.now() + 1000 * 60 * CODE_EXPIRY_MINUTES);

  const toCreate = {
    ...payload,
    senha: hashed,
    verificationCode,
    verificationCodeExpiry: expiresAt.toISOString(),
    isEnabled: false,
  };

  const created = await repo.create(toCreate);

  try {
    await emailService.sendVerificationEmail(
      created.email_funcionario,
      verificationCode
    );
  } catch (err) {
    console.error("Erro ao enviar email de verificação:", err);
  }

  return created;
}

async function update(cpf_funcionario, payload) {
  if (!payload.senha) {
    const err = new Error("Senha obrigatória para confirmar as alterações.");
    err.status = 400;
    throw err;
  }

  if (!payload.adminId) {
    const err = new Error("ID do administrador não fornecido.");
    err.status = 400;
    throw err;
  }

  const adminUser = await repo.findById(payload.adminId);
  if (!adminUser) {
    const err = new Error("Usuário administrador não encontrado.");
    err.status = 404;
    throw err;
  }

  const match = await bcrypt.compare(String(payload.senha), adminUser.senha);
  if (!match) {
    const err = new Error("Senha do administrador incorreta.");
    err.status = 401;
    throw err;
  }

  const targetFuncionario = await repo.findByCpf(cpf_funcionario);
  if (!targetFuncionario) {
    const err = new Error("Funcionário alvo não encontrado.");
    err.status = 404;
    throw err;
  }

  const dadosParaValidar = {
    ...payload,
    email_funcionario: targetFuncionario.email_funcionario,
    nivel_acesso: payload.nivel_acesso || targetFuncionario.nivel_acesso,
    senha: "SenhaValidadaPeloAdmin123",
  };

  const { valid, errors } = validateFuncionario(dadosParaValidar);
  if (!valid) {
    const err = new Error("Validação falhou");
    err.status = 400;
    err.details = errors;
    throw err;
  }

  const updatePayload = { ...payload };
  delete updatePayload.senha;
  delete updatePayload.adminId;
  delete updatePayload.verificationCode;
  delete updatePayload.passwordResetCode;

  return repo.update(cpf_funcionario, updatePayload);
}

async function remove(cpf_funcionario) {
  return repo.remove(cpf_funcionario);
}

async function changePassword(id, senhaAtual, novaSenha) {
  const funcionario = await repo.findById(id);

  if (!funcionario) {
    const err = new Error("Funcionário não encontrado");
    err.status = 404;
    throw err;
  }

  const match = await bcrypt.compare(String(senhaAtual), funcionario.senha);
  if (!match) {
    const err = new Error("Senha atual incorreta");
    err.status = 401;
    throw err;
  }

  const newHash = await bcrypt.hash(String(novaSenha), 10);
  return repo.updatePassword(id, newHash);
}

async function initiateEmailChange(id, currentPassword, newEmail) {
  const funcionario = await repo.findById(id);
  if (!funcionario) {
    const err = new Error("Funcionário não encontrado");
    err.status = 404;
    throw err;
  }

  const match = await bcrypt.compare(String(currentPassword), funcionario.senha);
  if (!match) {
    const err = new Error("Senha atual incorreta");
    err.status = 401;
    throw err;
  }

  const verificationCode = generate6Digit();
  const expiresAt = new Date(Date.now() + 1000 * 60 * CODE_EXPIRY_MINUTES);

  await repo.update(funcionario.cpf_funcionario, {
    verificationcode: verificationCode,
    verificationcodeexpiry: expiresAt.toISOString(),
    passwordresetcode: newEmail,
    passwordresetexpiry: expiresAt.toISOString(),
  });

  try {
    await emailService.sendVerificationEmail(newEmail, verificationCode);
  } catch (err) {
    console.error('Erro ao enviar email de verificação para novo email:', err);
  }

  return { message: 'Código enviado para o novo e-mail.' };
}

async function verifyEmailChange(id, code) {
  const funcionario = await repo.findById(id);
  if (!funcionario) {
    const err = new Error('Funcionário não encontrado');
    err.status = 404;
    throw err;
  }

  const now = new Date();

  if (!funcionario.verificationcode || funcionario.verificationcode !== code) {
    const err = new Error('Código de verificação inválido');
    err.status = 400;
    throw err;
  }

  if (now > new Date(funcionario.verificationcodeexpiry)) {
    const err = new Error('Código de verificação expirado');
    err.status = 400;
    throw err;
  }

  const newEmail = funcionario.passwordresetcode;
  if (!newEmail) {
    const err = new Error('Nenhum novo email pendente para alteração');
    err.status = 400;
    throw err;
  }

  await repo.update(funcionario.cpf_funcionario, {
    email_funcionario: newEmail,
    verificationcode: null,
    verificationcodeexpiry: null,
    passwordresetcode: null,
    passwordresetexpiry: null,
  });

  return { message: 'Email alterado com sucesso.' };
}

async function deleteAdmin(requesterId, targetCpf, adminPassword, reason) {
  const validatePasswordFn = async (hashArmazenado) => {
    return bcrypt.compare(String(adminPassword), hashArmazenado);
  };

  return repo.deleteAdminTransaction(requesterId, targetCpf, reason, validatePasswordFn);
}

async function verifyAccountCreation(id, code) {
  const funcionario = await repo.findById(id);
  if (!funcionario) {
    const err = new Error('Funcionário não encontrado');
    err.status = 404;
    throw err;
  }

  if (!funcionario.verificationcode || funcionario.verificationcode !== code) {
    const err = new Error('Código de verificação inválido');
    err.status = 400;
    throw err;
  }

  if (new Date() > new Date(funcionario.verificationcodeexpiry)) {
    const err = new Error('Código de verificação expirado');
    err.status = 400;
    throw err;
  }

  await repo.activateAccount(id);
  
  return { message: 'Conta verificada com sucesso!' };
}

module.exports = {
  listAll,
  getByCpf,
  getById,
  create,
  update,
  remove,
  changePassword,
  initiateEmailChange,
  verifyEmailChange,
  deleteAdmin,
  verifyAccountCreation, 
};