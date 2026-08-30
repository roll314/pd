import {IThumbGenerator} from '../thumbGenerators.ts';
import {IVideoThumbGeneratorConfig} from '../../config/models.ts';
import {SupportedFileType} from '../../../shared/isFileSupported.ts';
import {log, LogLevel, SystemPart} from '../../utils/log.ts';
import {getVideoQueue} from './videoQueue.ts';
import {getThumbFileHashSource} from '../getThumbFileHashSource.ts';
import {ThumbSize} from '../../../shared/thumbSize.ts';
import {THUMB_FILE_ALREADY_EXISTS_ERROR} from '../models/createThumbResult.ts';
import {ThumbType} from '../models/thumbType.ts';
import {createVideoPreview} from './createVideoPreview.ts';
import {createVideoFrameThumb} from './createVideoFrameThumb.ts';

interface IVideoThumbParams {
  size: number;
  type: ThumbType;
}

function getVideoThumbParams(
  config: IVideoThumbGeneratorConfig,
  thumbSize: ThumbSize,
): IVideoThumbParams {
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

export const videoThumbGenerator: IThumbGenerator<SupportedFileType.VIDEO> =
  async (
    filePath: string,
    config: IVideoThumbGeneratorConfig,
    thumbSize: ThumbSize,
  ): Promise<void> => {
    const videoTaskQueue = getVideoQueue();
    const params = getVideoThumbParams(config, thumbSize);

    log(
      `Video ${thumbSize} thumb generation adding to queue. Queue size ${videoTaskQueue.size}`,
      LogLevel.INFO,
      SystemPart.THUMB,
    );

    const tasks: Promise<void>[] = [
      videoTaskQueue.add(async () => {
        try {
          const res = await createVideoFrameThumb(
            filePath,
            config.pathToFFMpeg,
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
      }),
    ];

    if (thumbSize === ThumbSize.PREVIEW) {
      tasks.push(videoTaskQueue.add(async () => {
        try {
          const res = await createVideoPreview(
            filePath,
            config.pathToFFMpeg,
            config.previewVideoSizePx,
            ThumbType.PROPORTIONAL,
            getThumbFileHashSource(filePath, ThumbSize.PREVIEW),
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
      }));
    }

    const result = await Promise.allSettled(tasks);
    const rejectedTask = result.find(item => item.status === 'rejected');
    if (rejectedTask?.status === 'rejected') {
      throw rejectedTask.reason;
    }
  };
