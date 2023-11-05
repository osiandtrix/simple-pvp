import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0003",
  description: "Adds Keyboard Shortcut remapping",
  changes: [
    {
      type: "create",
      table: "remaps",
      params: [
        {
          field: "original_key",
          type: "VARCHAR(25)",
          primaryKey: true,
        },
        {
          field: "new_key",
          type: "VARCHAR(25)",
        },
      ],
    },
  ],
};

export default migration;
