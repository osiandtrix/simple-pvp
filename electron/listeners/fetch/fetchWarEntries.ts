const fetchWarEntries = (event: any) => {
  let data;
  try {
    data = global.db
      .prepare(`SELECT * FROM wars`)
      .all()
      .map((e: any) => ({
        guild_1: {
          name: e.attacker,
          id: e.attacker_id,
          kills: e.attacker_kills,
        },
        guild_2: {
          name: e.defender,
          id: e.defender_id,
          kills: e.defender_kills,
        },
      }));
  } catch {}

  event.reply("resolveWarEntries", data ?? []);
};

export default fetchWarEntries;
