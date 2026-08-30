import {ThumbSize} from '../../shared/thumbSize.ts';

const THUMB_CACHE_VERSION = '2';

export function getThumbFileHashSource(
  fileName: string,
  thumbType: ThumbSize,
): string {
  const fileInfo = Deno.statSync(fileName);
  const modifiedAt = fileInfo.mtime?.getTime() ?? 0;
  const changedAt = fileInfo.ctime?.getTime() ?? 0;

  // Версия исходника в ключе не позволяет отдать старую миниатюру после перезаписи файла.
  return [
    THUMB_CACHE_VERSION,
    fileName,
    thumbType,
    modifiedAt,
    changedAt,
    fileInfo.size,
  ].join('|');
}
