export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  LOG = 'LOG',
}

export enum SystemPart {
  COMMON = 'COMMON',
  DAV = 'DAV',
  THUMB = 'THUMB',
  HTTPS = 'HTTPS',
  DB = 'DB',
}

export function log(
  message: string,
  logLevel = LogLevel.LOG,
  systemPart = SystemPart.COMMON,
) {
  const date = new Date().toISOString();
  const str = `[${date}]\t[${systemPart}]\t${logLevel}\t${message}`;

  switch (logLevel) {
    case LogLevel.ERROR:
      console.error(str);
      break;
    case LogLevel.WARN:
      console.warn(str);
      break;
    case LogLevel.INFO:
      console.info(str);
      break;
    case LogLevel.LOG:
      console.log(str);
      break;
  }
}
