import {getConfig} from '../config/getConfig.ts';
import {log, LogLevel} from '../utils/log.ts';
import {hasOneOfRoles} from '../utils/hasOneOnfRoles.ts';
import {findPhysicalPath} from '../utils/findPhysicalPath.ts';
import {dirSize} from '../utils/dirSize.ts';
import {v2 as webDav} from 'npm:webdav-server@2.6.2';
import {PerUserQuotaStorageManager} from './perUserQuotaStorageManager.ts';
import {IDavUser, RootDirectoryRole} from '../config/models.ts';
import {UserManager} from './userManager.ts';

export interface IDavManagers {
  userManager: UserManager;
  privilegeManager: webDav.SimplePathPrivilegeManager;
  storageManager: PerUserQuotaStorageManager;
}

function createDavUser(user: IDavUser, userManagers: IDavManagers) {
  // configure users for app
  log(`Creating DAV user : ${user.username}`);
  const managedUser = userManagers.userManager.addUser(
    user.username,
    user.password,
    false,
  );

  // configure privileges for the root directories mapped names of that user.
  let currentReservedBytes = 0;
  user.rootDirectories.forEach((rootDir) => {
    const rootDirName = rootDir.name.startsWith("/")
      ? `/${user.username}${rootDir.name}`
      : `/${user.username}/${rootDir.name}`;
    userManagers.privilegeManager.setRights(
      managedUser,
      rootDirName,
      rootDir.roles,
    );

    userManagers.privilegeManager.setRights(managedUser, "/", [
      RootDirectoryRole.CAN_READ,
    ]);

    if (
      hasOneOfRoles(user.username, [
        RootDirectoryRole.ALL,
        RootDirectoryRole.CAN_WRITE,
      ], rootDir.name)
    ) {
      // compute the total size in bytes of this root dir and add it to the current space reserved to this user.
      const physicalPath = findPhysicalPath(user.username, rootDir.name);
      currentReservedBytes += dirSize(physicalPath);
    }
  });

  log(
    `Setting user quota: ${user.username} >>> ${currentReservedBytes} / ${user.quotaBytes} bytes.`,
    LogLevel.INFO,
  );
  userManagers.storageManager.setUserLimit(managedUser, user.quotaBytes);
  userManagers.storageManager.setUserReserved(
    managedUser,
    currentReservedBytes,
  );
}

export function createDavUsers(): IDavManagers {
  const config = getConfig();

  const userManager = new UserManager();

  const privilegeManager = new webDav.SimplePathPrivilegeManager();

  const storageManager = new PerUserQuotaStorageManager(
    config.davServer.defaultUserQuotaBytes,
    config.davServer.totalDiskSizeBytes,
  );

  const davManagers = { userManager, privilegeManager, storageManager };

  config.davServer.users.forEach((user) => createDavUser(user, davManagers));

  return davManagers;
}
