import DBMigrations from "../../database";
import * as DBFunctions from "../../database/functions";
import Logger from "../../ext/Logger";

const runVersionUpdate = async (event: any) => {
  const versionsToPatch: any = await DBMigrations;

  for (const version of versionsToPatch) {
    Logger.log(
      "info",
      `Updating Database to Version v.${version.default.version}`
    );

    for (const change of version.default.changes) {
      if (change.type === "create") DBFunctions.create(change);
      if (change.type === "alter") DBFunctions.alter(change);
    }

    DBFunctions.versionUpdate(version.default.version);
  }

  event.reply("resolveVersionUpdate");
};

export default runVersionUpdate;
