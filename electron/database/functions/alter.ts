import MigrationChanges from "../../types/MigrationChanges";

const alter = ({ table, params }: MigrationChanges) => {
  if (!params) return;
  
  for (const param of params) {
    global.db
      .prepare(`ALTER TABLE ${table} ADD COLUMN ${param.field} ${param.type}`)
      .run();
  }
};

export default alter;
