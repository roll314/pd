import { ICreateThumbResult, THUMB_FILE_ALREADY_EXISTS_ERROR } from '../models/createThumbResult.ts';
import { ThumbType } from '../models/thumbType.ts';
import { getThumbFilePath } from '../getThumbFilePath.ts';
import { isFileExists } from '../isFileExists.ts';
import { LOCKED_ERROR } from '../../dav/lockedError.ts';
import { touchFile } from '../../utils/touch-file.ts';
import { log, LogLevel, SystemPart } from '../../utils/log.ts';
import fs from 'node:fs';

const QUALITY = 3;
const FRAME_TIME = '00:00:01.000';

function getSquareThumbArgs(size: number): string[] {
  return [
    '-vf',
    `scale='if(gt(iw,ih),iw*${size}/ih,${size})':'if(gt(iw,ih),${size},ih*${size}/iw)',crop=${size}:${size}`
  ];
}

function getProportionalThumbArgs(size: number): string[] {
  return [
    '-vf',
    `scale='if(gt(a,1),${size},-2)':'if(gt(a,1),-2,${size})'`
  ];
}

function getArgs(thumbType: ThumbType, size: number) {
  switch (thumbType) {
    case ThumbType.SQUARE:
      return getSquareThumbArgs(size);
    case ThumbType.PROPORTIONAL:
      return getProportionalThumbArgs(size);
  }
}

export async function createVideoFrameThumb(
  filePath: string,
  pathToFFMpeg: string,
  size: number,
  thumbType: ThumbType,
  outFileHashSource: string,
): Promise<ICreateThumbResult> {
  const outFilePath = getThumbFilePath(outFileHashSource);

  if (await isFileExists(outFilePath)) {
    throw new Error(THUMB_FILE_ALREADY_EXISTS_ERROR);
  }

  const lockFilePath = `${outFilePath}.lock`;

  if (await isFileExists(lockFilePath)) {
    throw new Error(LOCKED_ERROR);
  }

  touchFile(lockFilePath);

  const args = [
    '-y',

    '-err_detect', 'ignore_err',
    '-fflags', '+discardcorrupt',

    '-i', filePath,
    ...getArgs(thumbType, size),
    '-ss', `${FRAME_TIME}`,
    '-vframes', '1',
    '-q:v', `${QUALITY}`,
    outFilePath,
  ];

  let success = false;
  let output = '';

  try {
    const command = new Deno.Command(pathToFFMpeg, {
      args,
      stdout: 'piped',
      stderr: 'piped',
    });

    const { stdout, stderr, success: wasSuccessful } = await command.output();

    success = wasSuccessful;
    const decoder = new TextDecoder('utf-8');
    const outText = decoder.decode(stdout);
    const errText = decoder.decode(stderr);
    output = outText + (errText ? `\n[stderr]: ${errText}` : '');
  } catch (e) {
    throw new Error(`Cannot run FFMpeg: ${e}`);
  } finally {
    log(
      `Remove lock file for ${lockFilePath}`,
      LogLevel.INFO,
      SystemPart.THUMB,
    );
    fs.unlinkSync(lockFilePath);
  }

  if (success) {
    return {
      execOutput: output,
      outFilePath,
    };
  } else {
    throw new Error(`FFMpeg failed:\n${output}`);
  }
}
