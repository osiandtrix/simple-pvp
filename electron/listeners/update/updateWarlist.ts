const updateWarlist = (event: any, data: any) => {
  global.db.prepare(`DELETE FROM wars`).run();

  const mappedObjects = data.map(
    ({ guild_1, guild_2 }: any) =>
      `(
        '${guild_1.name.replace("'", '"')}',
        ${guild_1.id},
        ${guild_1.kills},
        '${guild_2.name.replace("'", '"')}',
        ${guild_2.id},
        ${guild_2.kills}
      )`
  );

  global.db
    .prepare(
      `
      INSERT INTO wars 
        (attacker, attacker_id, attacker_kills, defender, defender_id, defender_kills)
      VALUES${mappedObjects.join(",")}
    `
    )
    .run();
};

export default updateWarlist;
