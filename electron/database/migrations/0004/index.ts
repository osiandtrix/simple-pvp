import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0004",
  changes: [
    {
      type: "create",
      table: "player_logs",
      params: [
        {
          field: "user_id",
          type: "INT",
          primaryKey: true,
        },
        {
          field: "hits",
          type: "INT",
        },
        {
          field: "first_hit",
          type: "TEXT",
        },
      ],
    },
    {
      type: "create",
      table: "guild_logs",
      params: [
        {
          field: "guild_id",
          type: "INT",
          primaryKey: true,
        },
        {
          field: "timestamp",
          type: "TEXT",
        },
      ],
    },
  ],
};

export default migration;
