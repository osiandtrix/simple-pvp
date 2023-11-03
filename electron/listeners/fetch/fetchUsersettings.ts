const fetchUsersettings = (event: any) => {
  event.reply(
    "resolveUsersettings",
    global.db.prepare(`SELECT * FROM settings`).all()[0] ?? {}
  );
};

export default fetchUsersettings;
