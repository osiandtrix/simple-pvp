const versionUpdate = (newVersion: string) => {
  global.db
    .prepare(
      `INSERT INTO version VALUES('${newVersion}', '${Math.floor(
        new Date().getTime() / 1000
      )}')`
    )
    .run();
};

export default versionUpdate;
