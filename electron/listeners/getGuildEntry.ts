const getGuildEntry = (event: any, index: number) => {
  const data = global.db
    .prepare(`SELECT * FROM wars LIMIT 1 OFFSET ${index + 1}`)
    .all()[0];

  const res = {
    guild_1: {
      name: data.attacker,
      id: data.attacker_id,
      kills: data.attacker_kills,
    },
    guild_2: {
      name: data.defender,
      id: data.defender_id,
      kills: data.defender_kills,
    },
  };

  event.reply("resolveGuildEntry", res);
};

export default getGuildEntry;
