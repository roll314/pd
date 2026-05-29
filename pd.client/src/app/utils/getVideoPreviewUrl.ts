import { ThumbSize } from '../../../../shared/thumbSize';

export function getVideoPreviewUrl(fileName: string, rootDir: string, subPath: string, thumbSize: ThumbSize): string {
  return `/api/videoPreview?filePath=${fileName}&thumbSize=${thumbSize}&rootDirName=${rootDir}&subPath=${subPath}`;
}
