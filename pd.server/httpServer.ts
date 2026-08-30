import { getConfig } from './config/getConfig.ts';
import { log, LogLevel, SystemPart } from './utils/log.ts';
import { initHttp } from './http/initHttp.ts';
import { IDavManagers } from './dav/createDavUsers.ts';
import { Application, ListenOptionsTls, Router } from '@oak/oak';

export async function initHttpServer(davManagers: IDavManagers) {
  const config = getConfig();

  const app = new Application();

  const router = new Router();

  initHttp(app, router, davManagers);

  app.addEventListener("error", (evt) => {
    log(
      `Unhandled error: ${evt.error}`,
      LogLevel.ERROR,
      SystemPart.HTTPS
    )
  });

  const httpsPort = config.httpsServer.port;
  const httpsHostname = config.httpsServer.hostname;

  const key = Deno.readTextFileSync(config.httpsServer.certKeyPath);
  const cert = Deno.readTextFileSync(config.httpsServer.certCrtPath);

  const options: ListenOptionsTls = {
    port: httpsPort,
    hostname: httpsHostname,
    secure: true,
    key,
    cert,
  };

  app.addEventListener('listen', (event) => {
    // Promise listen живёт до остановки сервера, поэтому успешный старт логируется событием listener.
    log(
      `Https server started at https://${event.hostname}:${event.port}`,
      LogLevel.LOG,
      SystemPart.HTTPS,
    );
  });

  try {
    await app.listen(options);
  } catch (e) {
    log(
      `Https server starting FAILED due to ${e}`,
      LogLevel.ERROR,
      SystemPart.HTTPS,
    );
  }
}
