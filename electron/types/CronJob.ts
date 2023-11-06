type CronJob = {
  cronTime: string;
  onTick: Function;
  start?: boolean;
  timeZone: string;
};

export default CronJob;
