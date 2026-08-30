import { IThumbGenerator } from '../thumbGenerators.ts';
import { IImageThumbGeneratorConfig } from '../../config/models.ts';
import { createImageThumb } from './createImageThumb.ts';
import { log, LogLevel, SystemPart } from '../../utils/log.ts';
import { getImageQueue } from './imageQueue.ts';
import { ThumbSize } from '../../../shared/thumbSize.ts';
import { getThumbFileHashSource } from '../getThumbFileHashSource.ts';
import { SupportedFileType } from '../../../shared/isFileSupported.ts';
import { THUMB_FILE_ALREADY_EXISTS_ERROR } from '../models/createThumbResult.ts';
import { ThumbType } from '../models/thumbType.ts';

interface IImageThumbParams {
  size: number;
  type: ThumbType;
}

function getImageThumbParams(
  config: IImageThumbGeneratorConfig,
  thumbSize: ThumbSize,
): IImageThumbParams {
  switch (thumbSize) {
    case ThumbSize.BIG:
      return {size: config.bigThumbSizePx, type: ThumbType.SQUARE};
    case ThumbSize.SMALL:
      return {size: config.smallThumbSizePx, type: ThumbType.SQUARE};
    case ThumbSize.PREVIEW:
      return {size: config.previewThumbSizePx, type: ThumbType.PROPORTIONAL};
    case ThumbSize.GRID:
      return {size: config.gridThumbSizePx, type: ThumbType.PROPORTIONAL};
  }

  throw new Error(`Unsupported thumb size: ${thumbSize}`);
}

export const imageThumbGenerator: IThumbGenerator<SupportedFileType.IMAGE> =
  async (
    filePath: string,
    config: IImageThumbGeneratorConfig,
    thumbSize: ThumbSize,
  ): Promise<void> => {
    const imageTaskQueue = getImageQueue();
    const params = getImageThumbParams(config, thumbSize);

    log(
      `Image ${thumbSize} thumb generation adding to queue. Queue size ${imageTaskQueue.size}`,
      LogLevel.INFO,
      SystemPart.THUMB,
    );

    await imageTaskQueue.add(async () => {
      try {
        const res = await createImageThumb(
          filePath,
          config.pathToNConvert,
          params.size,
          params.type,
          getThumbFileHashSource(filePath, thumbSize),
        );
        log(`${thumbSize} thumbnail for ${filePath} was successfully created as ${res.outFilePath}`, LogLevel.INFO, SystemPart.THUMB);
      } catch (e) {
        if ((e as Error).message === THUMB_FILE_ALREADY_EXISTS_ERROR) {
          log(`${thumbSize} thumbnail creations is already exists for ${filePath}`, LogLevel.INFO, SystemPart.THUMB);
        } else {
          log(`Cannot create ${thumbSize} thumbnail for ${filePath}: ${e}`, LogLevel.ERROR, SystemPart.THUMB);
          throw e;
        }
      }
    });
  };
