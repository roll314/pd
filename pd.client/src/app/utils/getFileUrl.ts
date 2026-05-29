export function getFileUrl(fileName: string, rootDir: string, subPath: string, download = false): string {
  let uri = `/api/file?filePath=${fileName}&rootDirName=${rootDir}&subPath=${subPath}`;
  if (download) {
    uri += `&download=true`;
  }
  return uri;
}
