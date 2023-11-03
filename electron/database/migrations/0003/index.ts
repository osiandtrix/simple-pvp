import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0003",
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
