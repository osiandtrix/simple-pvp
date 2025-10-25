import MigrationChanges from "../../types/MigrationChanges";

const alter = ({ table, params }: MigrationChanges) => {
  if (!params) return;

  for (const param of params) {
    try {
      global.db
        .prepare(`ALTER TABLE ${table} ADD COLUMN ${param.field} ${param.type}`)
        .run();
    } catch (e: any) {
      // Make migrations idempotent: ignore duplicate column errors
      if (typeof e?.message === "string" && e.message.includes("duplicate column")) {
        continue;
      }
      throw e;
    }
  }
};

export default alter;
