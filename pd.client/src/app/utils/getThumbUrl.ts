import { ThumbSize } from '../../../../shared/thumbSize';

export function getThumbUrl(
  fileName: string,
  rootDir: string,
  subPath: string,
  thumbSize: ThumbSize,
  version: number,
): string {
  const params = new URLSearchParams({
    filePath: fileName,
    thumbSize,
    rootDirName: rootDir,
    subPath,
    version: version.toString(),
  });

  return `/api/thumb?${params.toString()}`;
}
