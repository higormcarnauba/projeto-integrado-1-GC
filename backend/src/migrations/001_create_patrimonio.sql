CREATE TABLE IF NOT EXISTS patrimonio (
  id_patrimonio SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  status_patrimonio VARCHAR(64) NOT NULL DEFAULT 'Em uso',
  data_aquisicao DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);