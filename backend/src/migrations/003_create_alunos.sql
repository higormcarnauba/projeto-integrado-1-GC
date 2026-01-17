CREATE TABLE IF NOT EXISTS alunos (
  matricula VARCHAR(64) PRIMARY KEY,
  cod_plano INTEGER REFERENCES planos(cod_plano) ON DELETE RESTRICT,
  nome_aluno VARCHAR(255) NOT NULL,
  email_aluno VARCHAR(255) UNIQUE NOT NULL,
  cpf_aluno VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  data_nascimento DATE NOT NULL, 
  genero VARCHAR(20),
  logradouro VARCHAR(255), 
  endereco_aluno VARCHAR(255),
  numero VARCHAR(8),
  status_aluno VARCHAR(64) NOT NULL DEFAULT 'Inativo' 
    CHECK (status_aluno IN ('Ativo', 'Inativo')),
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);