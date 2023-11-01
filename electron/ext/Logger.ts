type logLevel = "info" | "error" | "warn" | "warning" | "success";

const wrapInColor = (color: string, str: string): string => {
  const resetColor = "\x1b[0m";

  let clr;
  switch (color) {
    case "blue":
      clr = "\x1b[94m";
      break;
    case "green":
      clr = "\x1b[32m";
      break;
    case "red":
      clr = "\x1b[31m";
      break;
    case "yellow":
      clr = `\x1b[33m`;
      break;
    default:
      clr = "\x1b[0m";
      break;
  }
  return `${clr}${str}${resetColor}`;
};

const getTimestamp = (): string => new Date().toLocaleTimeString();

const __INFO = (...args: Array<string>): void => {
  console.log(
    `${wrapInColor(
      "blue",
      `${getTimestamp()} [INFO]`.padEnd(18, " ")
    )} ${args.join(" ")}`
  );
};

const __ERROR = (...args: Array<string>): void => {
  console.log(
    `${wrapInColor(
      "red",
      `${getTimestamp()} [ERROR]`.padEnd(18, " ")
    )} ${args.join(" ")}`
  );
};

const __WARN = (...args: Array<string>): void => {
  console.log(
    `${wrapInColor(
      "yellow",
      `${getTimestamp()} [WARN]`.padEnd(18, " ")
    )} ${args.join(" ")}`
  );
};

const __SUCCESS = (...args: Array<string>): void => {
  console.log(
    `${wrapInColor(
      "green",
      `${getTimestamp()} [SUCCESS]`.padEnd(18, " ")
    )} ${args.join(" ")}`
  );
};

const log = (logLevel: logLevel | null, ...args: Array<string>): void => {
  switch (logLevel?.toLowerCase() ?? "") {
    case "info":
      __INFO(...args);
      break;
    case "error":
      __ERROR(...args);
      break;
    case "warn":
    case "warning":
      __WARN(...args);
      break;
    case "success":
      __SUCCESS(...args);
      break;
    default:
      console.log(...args);
  }
};

export default { log };
