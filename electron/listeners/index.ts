const fetchUserdata = (event: any) => {
  event.reply(
    "resolveUserdata",
    global.db.prepare(`SELECT * FROM userdata`).all()[0]
  );
};

const fetchUsersettings = (event: any) => {
  event.reply(
    "resolveUsersettings",
    global.db.prepare(`SELECT * FROM settings`).all()[0]
  );
};

export default { fetchUserdata, fetchUsersettings };
