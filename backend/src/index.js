const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: process.env.DOTENV_PATH || undefined });

const { init } = require('./db');
const patrimonioRouter = require('./routes/patrimonio');
const alunoRouter = require('./routes/alunos');
const planosRouter = require('./routes/planos');
const loginRouter = require('./routes/login');
const funcionarioRouter = require('./routes/funcionario');
const financeiroRouter = require('./routes/financeiro');
const authRoutes = require('./routes/auth');
const verificationRouter = require('./routes/verification');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/patrimonio', patrimonioRouter);
app.use('/api/alunos', alunoRouter);
app.use('/api/planos', planosRouter);
app.use('/api/login', loginRouter);
app.use('/api/funcionario', funcionarioRouter);
app.use('/api/financeiro', financeiroRouter);
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRouter);

async function start() {
  try {
    await init();
    app.listen(PORT, () => console.log(`Server escutando na porta: ${PORT}`));
  } catch (err) {
    console.error("Falha ao iniciar o servidor", err);
    process.exit(1);
  }
}

start();