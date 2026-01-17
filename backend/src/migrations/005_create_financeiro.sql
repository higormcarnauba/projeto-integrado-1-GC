CREATE TABLE IF NOT EXISTS financeiro (
    id_financeiro SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,          
    nome VARCHAR(255) NOT NULL,         
    data DATE NOT NULL,                
    categoria VARCHAR(100) NOT NULL,    
    valor NUMERIC(10, 2) NOT NULL,     
    descricao TEXT                      
);