import Cronjob from "../types/CronJob";

const check3x: Cronjob = {
  cronTime: "* * * * *",
  onTick: function () {
    if (!global.db) return;

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
