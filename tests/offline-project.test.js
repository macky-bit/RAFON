"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { databaseConfig } = require("../server");

const root = path.join(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

test("project configuration contains no external ranking credentials", () => {
  const environmentExample = read(".env.example");
  const server = read("server.js");
  assert.doesNotMatch(environmentExample, /GEMINI|API_KEY|generativelanguage/i);
  assert.doesNotMatch(server, /Gemini|generativelanguage|\/api\//i);
});

test("browser generator is fully offline and uses the five weighted criteria", () => {
  const application = read(path.join("scr", "app.js"));
  assert.doesNotMatch(application, /fetch\s*\(|XMLHttpRequest|rankedOutfitsFromAPI/i);
  assert.match(application, /activityPoints[\s\S]*\* 30/);
  assert.match(application, /stylePoints[\s\S]*\* 25/);
  assert.match(application, /colorPoints/);
  assert.match(application, /fitPoints[\s\S]*\* 15/);
  assert.match(application, /supportPoints/);
});

test("XAMPP database defaults remain configured", () => {
  const config = databaseConfig();
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 3306);
  assert.equal(config.user, "root");
  assert.equal(config.database, "pormatch");
});
