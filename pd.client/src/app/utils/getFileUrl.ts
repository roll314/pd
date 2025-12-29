export function getFileUrl(fileName: string, rootDir: string, subPath: string, session: string, download = false): string {
  let uri = `/api/file?filePath=${fileName}&rootDirName=${rootDir}&subPath=${subPath}&session=${session}`;
  if (download) {
    uri += `&download=true`;
  }
  return uri;
}
