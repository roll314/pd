import {getFileType, isFileSupported, SupportedFileType,} from '../../shared/isFileSupported.ts';
import { IThumbGenerator, THUMB_GENERATORS, ThumbGeneratorConfigMap } from '../thumb/thumbGenerators.ts';
import {getConfig} from '../config/getConfig.ts';
import {log, LogLevel, SystemPart} from '../utils/log.ts';
import {LOCKED_ERROR} from './lockedError.ts';
import {ThumbSize} from '../../shared/thumbSize.ts';


export enum GenerateThumbError {
  FILE_DOES_NOW_SUPPORTED = 'FILE_DOES_NOW_SUPPORTED',
  NOT_FOUND_THUMB_GENERATOR = 'NOT_FOUND_THUMB_GENERATOR',
  NOT_FOUND_THUMB_GENERATOR_CONFIG = 'NOT_FOUND_THUMB_GENERATOR_CONFIG',
}

export async function generateThumb(
  filePath: string,
  thumbSize: ThumbSize,
): Promise<void> {
  if (!isFileSupported(filePath)) {
    throw new Error(GenerateThumbError.FILE_DOES_NOW_SUPPORTED);
  }

  const fileType = getFileType(filePath) as SupportedFileType;
  const foundThumbGenerator = THUMB_GENERATORS[fileType];

  if (!foundThumbGenerator) {
    throw new Error(GenerateThumbError.NOT_FOUND_THUMB_GENERATOR);
  }

  const config = getConfig();
  const foundThumbGeneratorConfig = config.thumbGeneration[fileType] as ThumbGeneratorConfigMap[typeof fileType];

  if (!foundThumbGeneratorConfig) {
    throw new Error(GenerateThumbError.NOT_FOUND_THUMB_GENERATOR_CONFIG);
  }

  const generator = foundThumbGenerator as IThumbGenerator<typeof fileType>;

  try {
    return await generator(filePath, foundThumbGeneratorConfig, thumbSize);
  } catch (e) {
    if ((e as Error | undefined)?.message === LOCKED_ERROR) {
      log(
        `>>>>>> SKIP: Thumb generating for ${filePath} was skipped due to LOCKED and gonna be generated in the another thread`,
        LogLevel.WARN,
        SystemPart.DAV,
      );
    } else {
      log(
        `>>>>>> WARNING: Cannot generate thumb for ${filePath}.\n${
          JSON.stringify(e)
        }`,
        LogLevel.WARN,
        SystemPart.DAV,
      );
      throw e;
    }
  }
}
