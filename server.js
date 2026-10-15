"use strict";

const path = require("node:path");
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, "scr");

app.disable("x-powered-by");

let databasePool = null;
let databaseStatus = { connected: false, message: "Not checked yet" };

const databaseConfig = (withDatabase = true) => ({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  ...(withDatabase ? { database: process.env.DB_NAME || "pormatch" } : {}),
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

async function initializeDatabase() {
  const dbName = process.env.DB_NAME || "pormatch";
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error("DB_NAME contains unsupported characters.");
  const bootstrap = await mysql.createConnection(databaseConfig(false));
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();
  databasePool = mysql.createPool(databaseConfig(true));
  await databasePool.query("SELECT 1 AS ok");
  databaseStatus = { connected: true, message: `Connected to ${dbName}` };
  return databasePool;
}

async function getDatabase() {
  if (databasePool) return databasePool;
  try {
    return await initializeDatabase();
  } catch (error) {
    databaseStatus = { connected: false, message: error.message };
    return null;
  }
}

app.use(express.static(PUBLIC_DIR, { extensions: ["html"], index: "index.html", dotfiles: "deny" }));
app.use((_request, response) => response.sendFile(path.join(PUBLIC_DIR, "index.html")));

if (require.main === module) {
  const server = app.listen(PORT, "127.0.0.1", async () => {
    await getDatabase();
    console.log(`Pormatch is running at http://127.0.0.1:${PORT}`);
    console.log(`Database: ${databaseStatus.message}`);
    console.log("Recommendation engine: offline rules v2");
  });
  const shutdown = async () => {
    server.close();
    if (databasePool) await databasePool.end();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = { app, initializeDatabase, getDatabase, databaseConfig };
