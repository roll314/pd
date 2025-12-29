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

export const imageThumbGenerator: IThumbGenerator<SupportedFileType.IMAGE> =
  async (
    filePath: string,
    config: IImageThumbGeneratorConfig,
  ): Promise<void> => {
    const imageTaskQueue = getImageQueue();

    log(
      `Image thumb generation adding to queue. Queue size ${imageTaskQueue.size}`,
      LogLevel.INFO,
      SystemPart.THUMB,
    );

    const result = await Promise.allSettled([
      imageTaskQueue.add(async () => {
        try {
          const res = await createImageThumb(
            filePath,
            config.pathToNConvert,
            config.bigThumbSizePx,
            ThumbType.SQUARE,
            getThumbFileHashSource(filePath, ThumbSize.BIG)
          );
          log(`${ThumbSize.BIG} thumbnail for ${filePath} was successfully created as ${res.outFilePath}`, LogLevel.INFO, SystemPart.THUMB);
        } catch (e) {
          if ((e as Error).message === THUMB_FILE_ALREADY_EXISTS_ERROR) {
            log(`${ThumbSize.BIG} thumbnail creations is already exists for ${filePath}`, LogLevel.INFO, SystemPart.THUMB);
          } else {
            log(`Cannot create ${ThumbSize.BIG} thumbnail for ${filePath}: ${e}`, LogLevel.ERROR, SystemPart.THUMB);
            throw e;
          }
        }
      }),

      imageTaskQueue.add(async () => {
        try {
          const res = await createImageThumb(
            filePath,
            config.pathToNConvert,
            config.smallThumbSizePx,
            ThumbType.SQUARE,
            getThumbFileHashSource(filePath, ThumbSize.SMALL)
          );
          log(`${ThumbSize.SMALL} thumbnail for ${filePath} was successfully created as ${res.outFilePath}`, LogLevel.INFO, SystemPart.THUMB);
        } catch (e) {
          if ((e as Error).message === THUMB_FILE_ALREADY_EXISTS_ERROR) {
            log(`${ThumbSize.SMALL} thumbnail creations is already exists for ${filePath}`, LogLevel.INFO, SystemPart.THUMB);
          } else {
            log(`Cannot create ${ThumbSize.SMALL} thumbnail for ${filePath}: ${e}`, LogLevel.ERROR, SystemPart.THUMB);
            throw e;
          }
        }
      }),

      imageTaskQueue.add(async () => {
        try {
          const res = await createImageThumb(
            filePath,
            config.pathToNConvert,
            config.previewThumbSizePx,
            ThumbType.PROPORTIONAL,
            getThumbFileHashSource(filePath, ThumbSize.PREVIEW)
          );
          log(`${ThumbSize.PREVIEW} thumbnail for ${filePath} was successfully created as ${res.outFilePath}`, LogLevel.INFO, SystemPart.THUMB);
        } catch (e) {
          if ((e as Error).message === THUMB_FILE_ALREADY_EXISTS_ERROR) {
            log(`${ThumbSize.PREVIEW} thumbnail creations is already exists for ${filePath}`, LogLevel.INFO, SystemPart.THUMB);
          } else {
            log(`Cannot create ${ThumbSize.PREVIEW} thumbnail for ${filePath}: ${e}`, LogLevel.ERROR, SystemPart.THUMB);
            throw e;
          }
        }
      }),

      imageTaskQueue.add(async () => {
        try {
          const res = await createImageThumb(
            filePath,
            config.pathToNConvert,
            config.previewThumbSizePx,
            ThumbType.PROPORTIONAL,
            getThumbFileHashSource(filePath, ThumbSize.GRID)
          );
          log(`${ThumbSize.GRID} thumbnail for ${filePath} was successfully created as ${res.outFilePath}`, LogLevel.INFO, SystemPart.THUMB);
        } catch (e) {
          if ((e as Error).message === THUMB_FILE_ALREADY_EXISTS_ERROR) {
            log(`${ThumbSize.GRID} thumbnail creations is already exists for ${filePath}`, LogLevel.INFO, SystemPart.THUMB);
          } else {
            log(`Cannot create ${ThumbSize.GRID} thumbnail for ${filePath}: ${e}`, LogLevel.ERROR, SystemPart.THUMB);
            throw e;
          }
        }
      })
    ]);

    for (const item of result) {
      if (item.status === "rejected") {
        throw new Error(item.reason);
      }
    }
  };
