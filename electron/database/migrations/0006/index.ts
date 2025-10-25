import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0006",
  description: "Adds alwaysOnTop flag to settings",
  changes: [
    {
      type: "alter",
      table: "settings",
      params: [
        {
          field: "alwaysOnTop",
          type: "INT DEFAULT 0",
        },
      ],
    },
  ],
};

export default migration;

