const updateSettings = (event: any, data: any) => {
  // Check if minLevel column exists, if not, add it
  try {
    global.db.prepare(`SELECT minLevel FROM settings LIMIT 1`).get();
  } catch (error: any) {
    if (error.message.includes("no such column: minLevel")) {
      console.log("Adding missing minLevel column to settings table");
      global.db.prepare(`ALTER TABLE settings ADD COLUMN minLevel INT DEFAULT 0`).run();
    }
  }

  // Ensure alwaysOnTop column exists (migration safety)
  try {
    global.db.prepare(`SELECT alwaysOnTop FROM settings LIMIT 1`).get();
  } catch (error: any) {
    if (error.message.includes("no such column: alwaysOnTop")) {
      console.log("Adding missing alwaysOnTop column to settings table");
      global.db.prepare(`ALTER TABLE settings ADD COLUMN alwaysOnTop INT DEFAULT 0`).run();
    }
  }

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
