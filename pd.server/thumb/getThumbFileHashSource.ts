import {ThumbSize} from '../../shared/thumbSize.ts';

export function getThumbFileHashSource(
  fileName: string,
  thumbType: ThumbSize,
): string {
  return fileName + thumbType;
}
