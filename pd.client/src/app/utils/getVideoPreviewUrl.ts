import { ThumbSize } from '../../../../shared/thumbSize';

export function getVideoPreviewUrl(fileName: string, rootDir: string, subPath: string, thumbSize: ThumbSize): string {
  const params = new URLSearchParams({
    filePath: fileName,
    thumbSize,
    rootDirName: rootDir,
    subPath,
  });

  return `/api/videoPreview?${params.toString()}`;
}
