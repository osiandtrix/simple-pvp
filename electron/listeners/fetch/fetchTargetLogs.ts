const fetchTargetLogs = (event: any, userIds: Array<number>) => {
  let data;

  try {
    data = global.db
      .prepare(
        `SELECT * FROM player_logs WHERE user_id IN (${userIds.join(",")})`
      )
      .all();
  } catch {}

  event.reply("resolveTargetLogs", data ?? []);
};

export default fetchTargetLogs;
