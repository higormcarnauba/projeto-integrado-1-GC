const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
const backendEnvPath = path.resolve(__dirname, "..", ".env");

require("dotenv").config({ path: rootEnvPath });
if (fs.existsSync(backendEnvPath)) {
  require("dotenv").config({ path: backendEnvPath, override: true });
}

const migrationDir = path.resolve(__dirname, "migrations");

async function runMigrations() {
  const client = new Client({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.POSTGRES_DB || "projeto_db",
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.DB_PORT || 5433,
  });

  try {
    await client.connect();
    console.log("Conectado ao banco de dados para migrações.");

    const files = fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`Encontradas ${files.length} migrações para rodar.`);

    for (const file of files) {
      const filePath = path.join(migrationDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo de migração não encontrado: ${file}`);
      }
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`-> Rodando migração: ${file}`);
      await client.query(sql);
      console.log(`-> Sucesso em: ${file}`);
    }

    console.log("\nTodas as migrações foram aplicadas com sucesso!");
  } catch (err) {
    console.error("Erro durante a migração:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigrations();
}