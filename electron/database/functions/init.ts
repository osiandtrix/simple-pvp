import Database from "better-sqlite3";

declare global {
  var db: any;
}

const db = new Database("./database/data.db");
global.db = db;
