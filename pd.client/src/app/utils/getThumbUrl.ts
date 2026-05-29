import { ThumbSize } from '../../../../shared/thumbSize';

export function getThumbUrl(fileName: string, rootDir: string, subPath: string, thumbSize: ThumbSize): string {
  return `/api/thumb?filePath=${fileName}&thumbSize=${thumbSize}&rootDirName=${rootDir}&subPath=${subPath}`;
}
