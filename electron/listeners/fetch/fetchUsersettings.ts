const fetchUsersettings = (event: any) => {
  let data;
  try {
    data = global.db.prepare(`SELECT * FROM settings`).all()[0];
  } catch {}

  event.reply("resolveUsersettings", data ?? {});
};

export default fetchUsersettings;
