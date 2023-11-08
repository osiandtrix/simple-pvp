import Cronjob from "../types/CronJob";

const check3x: Cronjob = {
  cronTime: "* * * * *",
  onTick: function () {
    if (!global.db) return;

    const exists: boolean = db
      .prepare(
        `
        SELECT 1
        FROM sqlite_master 
        WHERE type='table' 
        AND name='player_logs';
      `
      )
      .get();

    if (!exists) return;

    global.db
      .prepare(
        `DELETE FROM player_logs WHERE ${Math.floor(
          new Date().getTime() / 1000
        )}-first_hit>46800`
      )
      .run();
  },
  start: true,
  timeZone: "America/Los_Angeles",
};
export default check3x;
