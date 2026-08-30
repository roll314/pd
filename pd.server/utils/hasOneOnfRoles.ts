import {getConfig} from "../config/getConfig.ts";
import {RootDirectoryRole} from "../config/models.ts";

export function hasOneOfRoles(
  usr: string,
  roles: RootDirectoryRole[],
  rootDirName: string,
): boolean {
  const matchingUsers = getConfig().davServer.users.filter((user) =>
    user.username === usr
  );
  if (typeof matchingUsers === "undefined" || matchingUsers.length !== 1) {
    return false;
  }

  const user = matchingUsers[0];
  const matchingRootDirs = user.rootDirectories.filter((rootDir) =>
    rootDir.name === rootDirName
  );

  if (
    typeof matchingRootDirs === "undefined" || matchingRootDirs.length !== 1
  ) {
    return false;
  }

  const rootDir = matchingRootDirs[0];

  for (const role of roles) {
    if (rootDir.roles.indexOf(role) >= 0) {
      return true;
    }
  }

  return false;
}
