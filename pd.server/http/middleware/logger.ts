import {log, LogLevel, SystemPart} from '../../utils/log.ts';
import {getConfig} from '../../config/getConfig.ts';
import {HttpLogLevel} from '../models/logLevel.ts';
import { Context, Middleware } from '@oak/oak';

export const logger = (): Middleware => async (ctx: Context, next) => {
  const config = getConfig();
  const logLevel = config.httpsServer.logLevel;

  const start = Date.now();

  await next();

  if (logLevel === HttpLogLevel.NONE) {
    return;
  }

  const now = Date.now();
  const duration = now - start;

  const method = ctx.request.method;
  const pathname = ctx.request.url.pathname;
  const status = ctx.response.status;

  let logMessage = `${method} ${pathname} → ${status} (${duration.toFixed(1)} ms)`;

  if (logLevel === HttpLogLevel.REQUEST_AND_BODY) {
    const query = ctx.request.url.searchParams;

    if (Object.keys(query).length) {
      logMessage += `\n\tQuery: ${query}`;
    }

    const body = ctx.request.body;

    if (Object.keys(body || {}).length) {
      logMessage += `\n\tBody: ${body}`;
    }

    logMessage += `\n-------`;
  }

  log(logMessage, LogLevel.LOG, SystemPart.HTTPS);
};
