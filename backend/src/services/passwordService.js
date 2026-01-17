const bcrypt = require("bcrypt");
const repo = require("../repositories/funcionarioRepository");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("./emailService");

const CODE_EXPIRY_MINUTES = 10;
const CODE_EXPIRY_MS = CODE_EXPIRY_MINUTES * 60 * 1000;

function generate6Digit() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function resendVerificationCode(cpf_funcionario) {
  const funcionario = await repo.findByCpf(cpf_funcionario);

  if (!funcionario) {
    const err = new Error("Funcionário não encontrado");
    err.status = 404;
    throw err;
  }

  if (funcionario.isEnabled) {
    const err = new Error("Email já verificado");
    err.status = 400;
    throw err;
  }

  const newCode = generate6Digit();
  const expiresAt = new Date(Date.now() + 1000 * 60 * CODE_EXPIRY_MINUTES);

  await repo.update(cpf_funcionario, {
    verificationcode: newCode,
    verificationcodeexpiry: expiresAt.toISOString(),
  });

  await sendVerificationEmail(funcionario.email, newCode);
  return { message: "Novo código de verificação enviado." };
}

async function initiatePasswordReset(email) {
  const user = await repo.findByEmail(email);

  if (!user) {
    const error = new Error("Email não encontrado na base de dados.");
    error.status = 404;
    throw error;
  }

  const code = generate6Digit();

  await repo.update(user.cpf_funcionario, {
    passwordresetcode: code,
    passwordresetexpiry: new Date(Date.now() + CODE_EXPIRY_MS),
  });

  await sendPasswordResetEmail(email, code);

  return { message: "Código de redefinição enviado para o seu email." };
}

async function resetPassword(email, code, newPassword) {
  const funcionario = await repo.findByEmail(email);

  if (!funcionario) {
    const err = new Error("Funcionário não encontrado");
    err.status = 404;
    throw err;
  }

  const now = new Date();

  const dbExpiry =
    funcionario.passwordResetExpiry || funcionario.passwordresetexpiry;
  const dbCode = funcionario.passwordResetCode || funcionario.passwordresetcode;

  const expiryDate = new Date(dbExpiry);

  if (dbCode !== code) {
    const err = new Error("Código de reset inválido");
    err.status = 400;
    throw err;
  }

  if (now > expiryDate) {
    const err = new Error("Código de reset expirado");
    err.status = 400;
    throw err;
  }

  const isSamePassword = await bcrypt.compare(
    String(newPassword),
    funcionario.senha
  );

  if (isSamePassword) {
    const err = new Error("A nova senha não pode ser igual à senha atual.");
    err.status = 400;
    throw err;
  }

  const hashedNewPassword = await bcrypt.hash(String(newPassword), 10);

  await repo.update(funcionario.cpf || funcionario.cpf_funcionario, {
    senha: hashedNewPassword,
    passwordresetcode: null,
    passwordresetexpiry: null,
  });

  return { message: "Senha redefinida com sucesso." };
}

module.exports = {
  resendVerificationCode,
  initiatePasswordReset,
  resetPassword,
};