const nodemailer = require("nodemailer");
const repo = require("../repositories/funcionarioRepository");

const CODE_EXPIRY_MINUTES = 15;
const CODE_EXPIRY_MS = CODE_EXPIRY_MINUTES * 60 * 1000;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generate6Digit = () =>
  String(Math.floor(100000 + Math.random() * 900000));

async function requestPasswordReset(email) {
  const user = await repo.findByEmail(email);

  if (!user) {
    const error = new Error("Email não encontrado na base de dados.");
    error.status = 404;
    throw error;
  }
  const code = generate6Digit();
  const expiration = new Date(Date.now() + CODE_EXPIRY_MS);

  await repo.update(user.cpf_funcionario, {
    passwordresetcode: code,
    passwordresetexpiry: expiration,
  });
  await sendPasswordResetEmail(email, code);

  return { message: "Código de redefinição enviado." };
}

async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: `Corpo em Forma - <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verificação de Email - Boas-Vindas à Corpo em Forma!",
    html: `
        <div>
            <div>
                <h1>Bem-vindo ao Time!</h1>
            </div>
            
            <div>
                <p>
                    Olá, <strong>novo colaborador</strong>!
                </p>
                <p>
                    É com grande entusiasmo que recebemos você na <strong>Academia Corpo em Forma</strong>. Estamos animados para ter seu talento e energia!
                </p>
                
                <div>
                    <p>
                        Seu código de ativação:
                    </p>
                    <strong>
                        ${code}
                    </strong>
                </div>
                
                <p>
                    Este código é pessoal e intransferível.<br>
                    Ele expira em <strong>${CODE_EXPIRY_MINUTES} minutos</strong>.
                </p>
            </div>
            
            <div>
                <p>
                    Seja bem-vindo(a) à nossa missão de transformar vidas!
                </p>
                <p>
                    Equipe Corpo em Forma.
                </p>
            </div>
        </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email de verificação enviado para ${email}: ${info.messageId}`
    );
    return info;
  } catch (error) {
    console.error(
      `Falha ao enviar email de verificação para ${email}. Erro:`,
      error
    );
    throw error;
  }
}

async function sendPasswordResetEmail(email, code) {
  const mailOptions = {
    from: `Corpo em Forma -<${process.env.SMTP_USER}>`,
    to: email,
    subject: "Redefinição de Senha - Seu Código Único",
    html: `
        <div>
            <div>
                <h2>Redefinição de Senha</h2>
            </div>
            
            <div>
                <p>
                    Olá,
                </p>
                <p>
                    Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Academia Corpo em Forma</strong>.
                </p>
                
                <div>
                    <p>
                        Use este código:
                    </p>
                    <strong>
                        ${code}
                    </strong>
                </div>
                
                <p>
                    Utilize este código na página de redefinição para criar uma nova senha.
                </p>
                
                <p>
                    <strong>IMPORTANTE:</strong> Este código expira em <strong>${CODE_EXPIRY_MINUTES} minutos</strong>.
                    Se você não solicitou esta redefinição, por favor, ignore este email. Sua senha atual permanecerá segura.
                </p>
            </div>
            
            <div>
                <p>
                    Segurança da Conta - Academia Corpo em Forma.
                </p>
            </div>
        </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email de reset enviado para ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Falha ao enviar email de reset para ${email}. Erro:`, error);
    throw error;
  }
}

async function sendPasswordResetEmail(email, code) {
  const mailOptions = {
    from: `Corpo em Forma <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Redefinição de Senha - Seu Código Único",
    html: `
        <div>
            <div>
                <h2>Redefinição de Senha</h2>
            </div>
            
            <div>
                <p>
                    Olá,
                </p>
                <p>
                    Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Academia Corpo em Forma</strong>.
                </p>
                
                <div>
                    <p>
                        Use este código:
                    </p>
                    <strong>
                        ${code}
                    </strong>
                </div>
                
                <p>
                    Utilize este código na página de redefinição para criar uma nova senha.
                </p>
                
                <p>
                    <strong>IMPORTANTE:</strong> Este código expira em <strong>${CODE_EXPIRY_MINUTES} minutos</strong>.
                    Se você não solicitou esta redefinição, por favor, ignore este email. Sua senha atual permanecerá segura.
                </p>
            </div>
            
            <div>
                <p>
                    Segurança da Conta - Academia Corpo em Forma.
                </p>
            </div>
        </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email de reset enviado para ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Falha ao enviar email de reset para ${email}. Erro:`, error);

    const err = new Error(
      "Falha no serviço de envio de email. Tente novamente mais tarde."
    );
    err.status = 500;
    err.originalError = error;
    throw err;
  }
}

async function verifyEmail(cpf_funcionario, code) {
  const funcionario = await repo.findByCpf(cpf_funcionario);

  if (!funcionario) {
    const err = new Error("Funcionário não encontrado");
    err.status = 404;
    throw err;
  }

  const now = new Date();

  if (funcionario.isEnabled) {
    const err = new Error("Email já verificado");
    err.status = 400;
    throw err;
  }

  if (funcionario.verificationCode !== code) {
    const err = new Error("Código de verificação inválido");
    err.status = 400;
    throw err;
  }

  if (now > new Date(funcionario.verificationCodeExpiry)) {
    const err = new Error("Código de verificação expirado");
    err.status = 400;
    throw err;
  }

  await repo.update(cpf_funcionario, {
    isenabled: true,
    verificationcode: null,
    verificationcodeexpiry: null,
  });

  return { message: "Email verificado com sucesso. Conta ativada." };
}

async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log(
      "Conexão SMTP verificada com sucesso. Pronto para enviar e-mails."
    );
    return { ok: true };
  } catch (err) {
    console.error(
      "Erro na verificação do SMTP. Verifique as variáveis SMTP_USER e SMTP_PASS no seu arquivo .env"
    );
    console.error("Detalhes do erro:", err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = {
  requestPasswordReset,
  sendVerificationEmail,
  sendPasswordResetEmail,
  verifyEmail,
  verifyTransporter,
  generate6Digit,
  CODE_EXPIRY_MINUTES,
  CODE_EXPIRY_MS,
};