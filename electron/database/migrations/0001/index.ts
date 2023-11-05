import DatabaseMigration from "../../../types/DatabaseMigration";

const migration: DatabaseMigration = {
  version: "0001",
  description: "Adds Table for Guildwars to persist across sessions",
  changes: [
    {
      type: "create",
      table: "wars",
      params: [
        {
          field: "attacker",
          type: "VARCHAR(100)",
        },
        {
          field: "attacker_id",
          type: "INT",
        },
        {
          field: "attacker_kills",
          type: "INT",
        },
        {
          field: "defender",
          type: "VARCHAR(100)",
        },
        {
          field: "defender_id",
          type: "INT",
        },
        {
          field: "defender_kills",
          type: "INT",
        },
      ],
    },
  ],
};

export default migration;
