import { ThumbSize } from '../../../../../shared/thumbSize';


export interface GetCheckThumbReq {
  filePath: string;
  thumbSize: ThumbSize;
  rootDirName: string;
  subPath: string;
}
