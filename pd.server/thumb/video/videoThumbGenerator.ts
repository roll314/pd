import {IThumbGenerator} from "../thumbGenerators.ts";
import { IVideoThumbGeneratorConfig } from '../../config/models.ts';
import { SupportedFileType } from '../../../shared/isFileSupported.ts';
import { log, LogLevel, SystemPart } from '../../utils/log.ts';
import { getVideoQueue } from './videoQueue.ts';
import { getThumbFileHashSource } from '../getThumbFileHashSource.ts';
import { ThumbSize } from '../../../shared/thumbSize.ts';
import { THUMB_FILE_ALREADY_EXISTS_ERROR } from '../models/createThumbResult.ts';
import { ThumbType } from '../models/thumbType.ts';
import { createVideoPreview } from './createVideoPreview.ts';
import { createVideoFrameThumb } from './createVideoFrameThumb.ts';

export const videoThumbGenerator: IThumbGenerator<SupportedFileType.VIDEO> =
  async (
    filePath: string,
    config: IVideoThumbGeneratorConfig,
  ): Promise<void> => {

    const videoTaskQueue = getVideoQueue();

    log(
      `Video thumb generation adding to queue. Queue size ${videoTaskQueue.size}`,
      LogLevel.INFO,
      SystemPart.THUMB,
    );

    const result = await Promise.allSettled([
      videoTaskQueue.add(async () => {
        try {
          const res = await createVideoFrameThumb(
            filePath,
            config.pathToFFMpeg,
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

      videoTaskQueue.add(async () => {
        try {
          const res = await createVideoFrameThumb(
            filePath,
            config.pathToFFMpeg,
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

      videoTaskQueue.add(async () => {
        try {
          const res = await createVideoFrameThumb(
            filePath,
            config.pathToFFMpeg,
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

      videoTaskQueue.add(async () => {
        try {
          const res = await createVideoFrameThumb(
            filePath,
            config.pathToFFMpeg,
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
      }),

      videoTaskQueue.add(async () => {
        try {
          const res = await createVideoPreview(
            filePath,
            config.pathToFFMpeg,
            config.previewVideoSizePx,
            ThumbType.PROPORTIONAL,
            getThumbFileHashSource(filePath, ThumbSize.PREVIEW)
          );
          log(`${ThumbSize.PREVIEW} preview video for ${filePath} was successfully created as ${res.outFilePath}`, LogLevel.INFO, SystemPart.THUMB);
        } catch (e) {
          if ((e as Error).message === THUMB_FILE_ALREADY_EXISTS_ERROR) {
            log(`${ThumbSize.PREVIEW} preview video creations is already exists for ${filePath}`, LogLevel.INFO, SystemPart.THUMB);
          } else {
            log(`Cannot create ${ThumbSize.PREVIEW} preview video for ${filePath}: ${e}`, LogLevel.ERROR, SystemPart.THUMB);
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
