const updateUserdata = (event: any, data: any) => {
  console.log(data);
  const keys = Object.keys(data);
  const values = Object.values(data);

  const mapped = Object.entries(data).map(
    ([key, value]: [string, unknown]) =>
      `${key}=${typeof value === "string" ? `'${value}'` : value}`
  );

  const exists: boolean =
    global.db.prepare(`SELECT * FROM userdata`).all()[0] !== undefined;

  if (exists)
    return global.db.prepare(`UPDATE userdata SET ${mapped.join(",")}`).run();

  global.db
    .prepare(
      `INSERT INTO userdata(${keys.join(",")}) VALUES(${values.join(",")})`
    )
    .run();
};

export default updateUserdata;
