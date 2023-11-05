const fetchUserdata = (event: any) => {
  let data;
  try {
    data = global.db.prepare(`SELECT * FROM userdata`).all()[0];
  } catch {}

  event.reply("resolveUserdata", data ?? {});
};

export default fetchUserdata;
