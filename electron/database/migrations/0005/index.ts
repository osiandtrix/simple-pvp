import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0005",
  description: "Adds minLevel field to settings table",
  changes: [
    {
      type: "alter",
      table: "settings",
      params: [
        {
          field: "minLevel",
          type: "INT DEFAULT 0",
        },
      ],
    },
  ],
};

export default migration;
