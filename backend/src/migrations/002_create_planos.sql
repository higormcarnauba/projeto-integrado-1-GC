CREATE TABLE IF NOT EXISTS planos (
  cod_plano SERIAL PRIMARY KEY, 
  nome_plano VARCHAR(255) UNIQUE NOT NULL,
  valor_plano DECIMAL(10, 2) NOT NULL,
  status_plano VARCHAR(64) NOT NULL DEFAULT 'Ativo' CHECK (status_plano IN ('Ativo', 'Inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duracao_unidade VARCHAR(10) NOT NULL DEFAULT 'Mensal' CHECK (duracao_unidade IN ('Mensal', 'Diário', 'Anual'))
);