const updateSettings = (event: any, data: any) => {
  const keys = Object.keys(data);
  const values = Object.values(data).map((e: any) =>
    typeof e === "string" ? `'${e}'` : e
  );

  const mapped = Object.entries(data).map(
    ([key, value]: [string, unknown]) =>
      `${key}=${typeof value === "string" ? `'${value}'` : value}`
  );

  const exists: boolean =
    global.db.prepare(`SELECT * FROM settings`).all()[0] !== undefined;

  if (exists)
    return global.db.prepare(`UPDATE settings SET ${mapped.join(",")}`).run();

  global.db
    .prepare(
      `INSERT INTO settings(${keys.join(",")}) VALUES(${values.join(",")})`
    )
    .run();
};

export default updateSettings;
