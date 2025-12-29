import * as path from "@std/path";
import {Md5} from 'npm:ts-md5@1.3.1';
import {getConfig} from '../config/getConfig.ts';

export function getThumbFilePath(hashSource: string): string {
  const config = getConfig();
  const outDirPath = config.thumbGeneration.pathToThumbs;

  const hash = Md5.hashStr(hashSource);
  const fileName = `${hash}.jpg`;

  return path.join(outDirPath, fileName);
}
