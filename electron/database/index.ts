import fs from "node:fs";
import "./functions/init";
import DatabaseMigration from "../types/DatabaseMigration";
import Database from "better-sqlite3";
import { SqliteError } from "better-sqlite3";

const path = "./electron/database/migrations";

const main = async (): Promise<Array<DatabaseMigration>> => {
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
