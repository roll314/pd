import fs from 'node:fs';
import {getConfig} from '../config/getConfig.ts';
import {v2 as webDav} from 'npm:webdav-server@2.6.2';
import {log, LogLevel} from '../utils/log.ts';

export function setDavFs(davServer: webDav.WebDAVServer) {
  const config = getConfig();

  config.davServer.users.forEach((user) => {
    user.rootDirectories.forEach((rootDir) => {
      try {
        fs.statSync(rootDir.physicalPath);

        const rootDirName = rootDir.name.startsWith("/")
          ? `/${user.username}${rootDir.name}`
          : `/${user.username}/${rootDir.name}`;

        davServer.setFileSystem(
          rootDirName,
          new webDav.PhysicalFileSystem(rootDir.physicalPath),
          (success) => {
            if (success) {
              log(
                `User directory mounted: ${rootDirName} -> ${rootDir.physicalPath}`,
                LogLevel.LOG,
              );
            } else {
              const errMsg =
                `Cannot map physical path: ${rootDir.physicalPath} into: ${rootDirName}`;
              log(errMsg, LogLevel.ERROR);

              throw new Error(errMsg);
            }
          },
        );
      } catch (e) {
        log(
          `ERROR: Configuration problem: Check the users_config.json configuration file and ensure that the physical path exists and is readable: ${rootDir.physicalPath}`,
          LogLevel.ERROR,
        );
      }
    });
  });
}

export function setRootDirFs(davServer: webDav.WebDAVServer) {
  const rootDirName = "/";
  const rootDirPhysicalPath = getConfig().davServer.rootDirPhysicalPath;

  try {
    fs.statSync(rootDirPhysicalPath);

    davServer.setFileSystem(
      rootDirName,
      new webDav.PhysicalFileSystem(rootDirPhysicalPath),
      (success) => {
        if (success) {
          log(
            `Root directory mounted: ${rootDirName} -> ${rootDirPhysicalPath}`,
            LogLevel.LOG,
          );
        } else {
          const errMsg =
            `Cannot map physical path: ${rootDirPhysicalPath} into: ${rootDirName}`;
          log(errMsg, LogLevel.ERROR);

          throw new Error(errMsg);
        }
      },
    );
  } catch (e) {
    log(
      `ERROR: Configuration problem: Check the users_config.json configuration file and ensure that the physical path exists and is readable: ${rootDirPhysicalPath}`,
      LogLevel.ERROR,
    );
  }
}
