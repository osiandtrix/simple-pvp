import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const initDatabase = () => {
  let db;

  // Determine a persistent, writable location for the database
  // app.getPath("userData") is now guaranteed to be available since we call this after app.whenReady()
  const userData = app.getPath("userData");
  const baseDir = path.join(userData, "database");

  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  const dbPath = path.join(baseDir, "data.db");

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "");
    db = new Database(dbPath);
  } else {
    db = new Database(dbPath);
  }

  db.pragma("journal_mode = WAL");

  db.prepare(
    `CREATE TABLE IF NOT EXISTS version(
        vNumber VARCHAR(5) PRIMARY KEY,
        date TEXT
      )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS guild_logs(
        guild_id INT,
        timestamp TEXT
      )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS player_logs(
        user_id INT,
        hits INT,
        first_hit INT
      )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS remaps(
        original_key VARCHAR(25),
        new_key VARCHAR(25)
      )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS settings(
        maxLevel INT,
        minLevel INT DEFAULT 0,
        api_key TEXT
      )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS userdata(
        userid INT PRIMARY KEY,
        guildid INT
      )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS wars(
        attacker VARCHAR(100),
        attacker_id INT,
        attacker_kills INT,
        defender VARCHAR(100),
        defender_id INT,
        defender_kills INT
      )`
  ).run();

  db.prepare(`DELETE FROM version`).run();

  db.prepare(
    `INSERT INTO version VALUES
      ('0000', null),
      ('0001', null),
      ('0002', null),
      ('0003', null),
      ('0004', null),
      ('0005', null)`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS stats(
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    start TEXT,
    end TEXT,
    kills INT DEFAULT 0
  )`
  ).run();

  global.db = db;
};

export default initDatabase;
