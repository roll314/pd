import {getConfig} from './config/getConfig.ts';
import {log, LogLevel} from './utils/log.ts';
import {initDavServer} from './davServer.ts';
import {initHttpServer} from './httpServer.ts';

try {
  getConfig();
} catch (e) {
  log(`Cannot read config file. Exiting. \n${e}`, LogLevel.ERROR);
  Deno.exit(-99);
}

const davManagers = initDavServer();

await initHttpServer(davManagers);

addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  event.preventDefault();
});
