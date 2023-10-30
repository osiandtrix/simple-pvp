import MigrationChanges from "./MigrationChanges";

type DatabaseMigration = {
  version: string;
  changes: Array<MigrationChanges>;
};

export default DatabaseMigration;
