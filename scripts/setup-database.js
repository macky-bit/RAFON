"use strict";

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const dbName = process.env.DB_NAME || "pormatch";
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error("DB_NAME contains unsupported characters.");
  const sqlPath = path.join(__dirname, "..", "database", "pormatch.sql");
  let sql = fs.readFileSync(sqlPath, "utf8");
  sql = sql.replace(/`pormatch`/g, `\`${dbName}\``);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true
  });
  await connection.query(sql);
  await connection.query(`USE \`${dbName}\``);
  const [tables] = await connection.query("SHOW FULL TABLES");
  await connection.end();
  console.log(`Database ${dbName} initialized successfully with ${tables.length} tables/views.`);
}

main().catch(error => {
  console.error(`Database setup failed: ${error.message}`);
  process.exitCode = 1;
});
