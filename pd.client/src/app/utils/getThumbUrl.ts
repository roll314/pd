import { ThumbSize } from '../../../../shared/thumbSize';

export function getThumbUrl(fileName: string, rootDir: string, subPath: string, thumbSize: ThumbSize, session: string): string {
  return `/api/thumb?filePath=${fileName}&thumbSize=${thumbSize}&rootDirName=${rootDir}&subPath=${subPath}&session=${session}`;
}
