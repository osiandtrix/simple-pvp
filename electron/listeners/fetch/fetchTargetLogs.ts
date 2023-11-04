const fetchTargetLogs = (event: any, userIds: Array<number>) => {
  event.reply(
    "resolveTargetLogs",
    global.db
      .prepare(
        `SELECT * FROM player_logs WHERE user_id IN (${userIds.join(",")})`
      )
      .all() ?? []
  );
};

export default fetchTargetLogs;
