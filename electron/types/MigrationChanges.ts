import DBParams from "./DBParams";

type MigrationChanges = {
  type: "drop" | "create" | "alter";
  table: string;
  params?: Array<DBParams>;
};

export default MigrationChanges;
