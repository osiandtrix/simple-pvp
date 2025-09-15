import MigrationChanges from "../../types/MigrationChanges";

const create = ({ table, params }: MigrationChanges) => {
  if (!params) return;

  global.db
    .prepare(
      `CREATE TABLE ${table} (${params
        .map((e) => `${e.field} ${e.type}`)
        .join(", ")});`
    )
    .run();
};

export default create;
