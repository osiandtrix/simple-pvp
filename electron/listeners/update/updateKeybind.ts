const updateKeybind = (event: any, data: any) => {
  const { remap, key } = data;

  const exists: any = global.db
    .prepare(`SELECT * FROM remaps WHERE original_key='${key}'`)
    .get();

  if (exists)
    return global.db
      .prepare(
        `UPDATE remaps SET new_key='${remap}' WHERE original_key='${key}'`
      )
      .run();

  global.db.prepare(`INSERT INTO remaps VALUES('${key}', '${remap}')`).run();
};

export default updateKeybind;
