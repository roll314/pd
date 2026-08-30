import { resolve } from '@std/path';
import { Context, Middleware, Next, send } from '@oak/oak';
import {log, LogLevel, SystemPart} from '../../utils/log.ts';
import {getConfig} from '../../config/getConfig.ts';


export const staticFiles = (): Middleware => {
  const config = getConfig();
  const clientDir = config.httpsServer.clientDir;

  log(`Client web application will be served from: ${clientDir}`, LogLevel.LOG, SystemPart.HTTPS);

  return async (ctx: Context, next: Next) => {
    const path = ctx.request.url.pathname;

    // go with api
    if (path.startsWith('/api')) {
      return await next();
    }

    const resolvedClientDir =  resolve(clientDir);

    try {
      await send(ctx, path, {
        root: resolvedClientDir,
        index: 'index.html', // fallback
      });
    } catch {
      try {
        // file was not found return index.html as fallback
        await send(ctx, '/index.html', {
          root: resolvedClientDir,
        });
      } catch (e) {
        ctx.response.status = 404;
        ctx.response.body = 'no client index.html found';
      }
    }
  }
};
