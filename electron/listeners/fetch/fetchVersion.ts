import fs from "node:fs";
import DatabaseMigration from "../../types/DatabaseMigration";

const fetchVersion = async (event: any) => {
  let current;
  try {
    current = global.db
      .prepare(`SELECT MAX(CAST(vNumber AS INT)) AS current FROM version`)
      .get().current;
  } catch {}

  const versions = fs.readdirSync("./electron/database/migrations");
  const maxVersion = Math.max(...versions.map((e: string) => parseInt(e)));

  let counter = parseInt(current ?? "-1") + 1;
  const migrations: Array<DatabaseMigration> = [];
  while (counter <= maxVersion) {
    migrations.push(
      await import(
        `../../database/migrations/${counter.toString().padStart(4, "0")}`
      )
    );
    counter++;
  }

  event.reply("resolveVersion", {
    current: (current ?? { max: "-1" }).toString().padStart(4, "0"),
    max: maxVersion.toString().padStart(4, "0"),
    migrations: migrations.map((e: any) => e.default),
  });
};

export default fetchVersion;
