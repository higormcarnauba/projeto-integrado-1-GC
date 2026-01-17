CREATE SEQUENCE IF NOT EXISTS funcionarios_id_seq;

CREATE TABLE IF NOT EXISTS funcionarios (
	id_funcionario VARCHAR(64) DEFAULT nextval('funcionarios_id_seq')::text PRIMARY KEY,
	nome_funcionario VARCHAR(255) NOT NULL,
	email_funcionario VARCHAR(255) UNIQUE NOT NULL,
	cpf_funcionario VARCHAR(14) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	nivel_acesso VARCHAR(64) NOT NULL DEFAULT 'Funcionario',
	isEnabled BOOLEAN NOT NULL DEFAULT FALSE,
	verificationCode VARCHAR(128),
	verificationCodeExpiry TIMESTAMP WITH TIME ZONE,
	passwordResetCode VARCHAR(128),
	passwordResetExpiry TIMESTAMP WITH TIME ZONE
);