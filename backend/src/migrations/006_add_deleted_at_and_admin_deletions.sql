ALTER TABLE funcionarios
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS admin_deletions (
  id SERIAL PRIMARY KEY,
  target_id INTEGER,
  target_cpf TEXT,
  performed_by INTEGER,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);
