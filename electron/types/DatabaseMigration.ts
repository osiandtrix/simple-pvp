import MigrationChanges from "./MigrationChanges";

type DatabaseMigration = {
  version: string;
  description: string;
  changes: Array<MigrationChanges>;
};

export default DatabaseMigration;
