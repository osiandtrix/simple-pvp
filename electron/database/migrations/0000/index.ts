import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0000",
  changes: [
    {
      type: "create",
      table: "version",
      params: [
        {
          field: "vNumber",
          type: "VARCHAR(5)",
          primaryKey: true,
        },
        {
          field: "date",
          type: "TEXT",
        },
      ],
    },
  ],
};

export default migration;
