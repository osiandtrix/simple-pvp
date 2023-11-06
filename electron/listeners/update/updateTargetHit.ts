type Payload = {
  userId: number;
  hit: 0 | 1;
};

const updateTargetHit = (event: any, data: Payload) => {
  const { userId, hit } = data;

  const exists: any = global.db
    .prepare(`SELECT * FROM player_logs WHERE user_id='${userId}'`)
    .get();

  if (exists)
    return global.db
      .prepare(
        `UPDATE player_logs SET hits=hits+${hit} WHERE user_id='${userId}'`
      )
      .run();

  if (hit === 0) return;

  global.db
    .prepare(
      `INSERT INTO player_logs VALUES(${userId}, 1, ${Math.floor(
        new Date().getTime() / 1000
      )})`
    )
    .run();
};

export default updateTargetHit;
