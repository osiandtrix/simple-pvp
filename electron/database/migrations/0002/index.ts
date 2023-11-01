import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0002",
  changes: [
    {
      type: "create",
      table: "userdata",
      params: [
        {
          field: "userid",
          type: "INT",
          primaryKey: true,
        },
        {
          field: "guildid",
          type: "INT",
        },
      ],
    },
    {
      type: "create",
      table: "settings",
      params: [
        {
          field: "maxLevel",
          type: "INT",
        },
        {
          field: "api_key",
          type: "TEXT",
        },
      ],
    },
  ],
};

export default migration;
