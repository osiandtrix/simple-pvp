import fs from "node:fs";
import "./functions/init";
import DatabaseMigration from "../types/DatabaseMigration";
import Database, { SqliteError } from "better-sqlite3";

const path = "./electron/database/migrations";

const main = async (): Promise<Array<DatabaseMigration>> => {
  if (!fs.existsSync("./database")) fs.mkdirSync("./database");
  if (!fs.existsSync("./database/data.db")) {
    const createStream = fs.createWriteStream("./database/data.db");
    createStream.end();

    const db = new Database("./database/data.db");
    db.pragma("journal_mode = WAL");

    // db.prepare(
    //   `CREATE TABLE version(
    //   vNumber VARCHAR(5) PRIMARY KEY,
    //   date TEXT
    // )`
    // ).run();

    // db.prepare(
    //   `INSERT INTO version VALUES('0000', '${new Date().getTime()}')`
    // ).run();
  }

  let currentVersion: number | null;
  const migrationPaths = fs.readdirSync(path);

  try {
    const { res } = global.db
      .prepare(`SELECT MAX(CAST(vNumber as INTEGER)) as res FROM version`)
      .get() as { res: number };

    currentVersion = res;
  } catch (e: unknown) {
    if (!(e instanceof SqliteError)) throw e;

    if (e.message.startsWith("no such table"))
      return Promise.all(
        migrationPaths.map((e) => import(`./migrations/${e}`))
      );
  }

  migrationPaths.sort();

  const migrations = migrationPaths
    .filter((e) => parseInt(e) > (currentVersion ?? 0))
    .map((e) => import(`./migrations/${e}`));

  return Promise.all(migrations);
};

export default main();
