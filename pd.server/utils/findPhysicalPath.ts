import {getConfig} from "../config/getConfig.ts";

export function findPhysicalPath(username: string, homeDir: string): string {
  const homeDirPhysicalPath: string[][] = getConfig().davServer.users.filter(
    (user) => user.username === username
  ).map((user) => {
    return user.rootDirectories.filter((rootDir) => rootDir.name === homeDir)
      .map((rootDir) => rootDir.physicalPath);
  });

  return homeDirPhysicalPath[0][0];
}
