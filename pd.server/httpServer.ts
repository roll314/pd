import { getConfig } from './config/getConfig.ts';
import { log, LogLevel, SystemPart } from './utils/log.ts';
import { initHttp } from './http/initHttp.ts';
import { IDavManagers } from './dav/createDavUsers.ts';
import { Application, ListenOptionsTls, Router } from '@oak/oak';
import { serveTls } from "https://deno.land/std/http/mod.ts";

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

  try {
    // хер знает почему это в докере заканчивается ERR_SSL_PROTOCOL_ERROR, загадка дыры
    await app.listen(options);

    // не работает http2
  /* serveTls(
      async (req) => {
        const resp = await app.handle(req);
        return resp || new Response("Not found", { status: 404 });
      },
      options
    );
*/
    log(
      `Https server started at https://${httpsHostname}:${httpsPort}`,
      LogLevel.LOG,
      SystemPart.HTTPS,
    );
  } catch (e) {
    log(
      `Https server starting sa FAILED due to ${e}`,
      LogLevel.ERROR,
      SystemPart.HTTPS,
    );
  }
}
