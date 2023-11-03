const fetchUserdata = (event: any) => {
  event.reply(
    "resolveUserdata",
    global.db.prepare(`SELECT * FROM userdata`).all()[0] ?? {}
  );
};

export default fetchUserdata;
