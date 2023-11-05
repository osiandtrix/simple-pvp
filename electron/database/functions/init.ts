import Database from "better-sqlite3";
import fs from "node:fs";

if (!fs.existsSync("database")) fs.mkdirSync("database");

const db = new Database("./database/data.db");
db.pragma("journal_mode = WAL");
global.db = db;
