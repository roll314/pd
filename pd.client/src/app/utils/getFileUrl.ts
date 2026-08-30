export function getFileUrl(fileName: string, rootDir: string, subPath: string, download = false): string {
  const params = new URLSearchParams({
    filePath: fileName,
    rootDirName: rootDir,
    subPath,
  });

  if (download) {
    params.set('download', 'true');
  }

  return `/api/file?${params.toString()}`;
}
