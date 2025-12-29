import {v2 as webDav} from "npm:webdav-server@2.6.2";
import fs from "node:fs";
import {setDavFs, setRootDirFs} from "./dav/setDavFs.ts";
import {log, LogLevel} from "./utils/log.ts";
import {afterLogListener} from "./dav/listeners/afterLogListener.ts";
import {afterPUTListener} from "./dav/listeners/afterPUTListener.ts";
import {PerUserQuotaStorageManager} from "./dav/perUserQuotaStorageManager.ts";
import {createDavUsers, IDavManagers} from "./dav/createDavUsers.ts";
import {getConfig} from "./config/getConfig.ts";
import {UserManager} from "./dav/userManager.ts";
import {beforeDELETEListener} from './dav/listeners/beforeDELETEListener.ts';

export function initDavServer(): IDavManagers {
  const config = getConfig();

  let userManager: UserManager;
  let privilegeManager: webDav.SimplePathPrivilegeManager;
  let storageManager: PerUserQuotaStorageManager;

  let davManagers: IDavManagers;

  try {
    davManagers = createDavUsers();
    userManager = davManagers.userManager;
    privilegeManager = davManagers.privilegeManager;
    storageManager = davManagers.storageManager;
  } catch (e) {
    log(`Cannot create dav users. Exiting. \n${e}`, LogLevel.ERROR);
    Deno.exit(-89);
  }

  const davPort = config.davServer.port;
  const davHostname = config.davServer.hostname;

  const davServer = new webDav.WebDAVServer({
    // HTTP Digest authentication with the realm 'Default realm'
    // httpAuthentication: new webdav.HTTPDigestAuthentication(userManager, 'Default realm'),
    // basic auth only for synology cloud sync
    httpAuthentication: new webDav.HTTPBasicAuthentication(
      userManager,
      'Default realm',
    ),
    requireAuthentification: true,
    privilegeManager,
    storageManager,
    hostname: davHostname,
    port: davPort,
    https: {
      key: fs.readFileSync(config.httpsServer.certKeyPath),
      cert: fs.readFileSync(config.httpsServer.certCrtPath),
    },
  });

  try {
    setDavFs(davServer);
    setRootDirFs(davServer);
  } catch (e) {
    log(`Cannot set dav dirs. Exiting. \n${e}`, LogLevel.ERROR);
    Deno.exit(-79);
  }

  davServer.beforeRequest(beforeDELETEListener);
  davServer.afterRequest(afterLogListener);
  davServer.afterRequest(afterPUTListener);

  davServer.start((server) => {
    log(
      `WebDAV server started at https://${davHostname}:${davPort}`,
      LogLevel.LOG,
    );
  });

  return davManagers;
}
