import { ICreateThumbResult, THUMB_FILE_ALREADY_EXISTS_ERROR } from '../models/createThumbResult.ts';
import { ThumbType } from '../models/thumbType.ts';
import { getThumbFilePath } from '../getThumbFilePath.ts';
import { isFileExists } from '../isFileExists.ts';
import { LOCKED_ERROR } from '../../dav/lockedError.ts';
import { touchFile } from '../../utils/touch-file.ts';
import { log, LogLevel, SystemPart } from '../../utils/log.ts';
import fs from 'node:fs';
import { getVideoPreviewFilePath } from '../getVideoPreviewFilePath.ts';


const ENCODE_CODEC_NAME = 'libsvtav1';
// const ENCODE_CODEC_NAME = 'libvpx-vp9';
// const ENCODE_CODEC_NAME = 'mpeg4';

const ENCODE_CODEC_PRESET = '8';

const TARGET_FRP: number = 20;
const REMOVE_AUDIO: boolean = false;
const DURATION_SEC: number = -1;
const USE_PIX_FMT: boolean = true;

function getSquareVideoArgs(size: number): string[] {
  return [
    '-vf',
    `scale='if(gt(iw,ih),iw*${size}/ih,${size})':'if(gt(iw,ih),${size},ih*${size}/iw)',crop=${size}:${size}`,
    '-c:v', ENCODE_CODEC_NAME,
    '-preset', ENCODE_CODEC_PRESET,
    '-crf', '28',
    '-movflags', '+faststart'
  ];
}

function getProportionalVideoArgs(size: number): string[] {
  return [
    '-vf',
    `scale='if(gt(a,1),${size},-2)':'if(gt(a,1),-2,${size})'`,
    '-c:v', ENCODE_CODEC_NAME,
    '-preset', ENCODE_CODEC_PRESET,
    '-crf', '28',
    '-movflags', '+faststart'
  ];
}

function getArgs(thumbType: ThumbType, size: number) {
  switch (thumbType) {
    case ThumbType.SQUARE:
      return getSquareVideoArgs(size);
    case ThumbType.PROPORTIONAL:
      return getProportionalVideoArgs(size);
  }
}

export async function createVideoPreview(
  filePath: string,
  pathToFFMpeg: string,
  size: number,
  thumbType: ThumbType,
  outFileHashSource: string,
): Promise<ICreateThumbResult> {
  const outFilePath = getVideoPreviewFilePath(outFileHashSource);

  if (await isFileExists(outFilePath)) {
    throw new Error(THUMB_FILE_ALREADY_EXISTS_ERROR);
  }

  const lockFilePath = `${outFilePath}.lock`;

  if (await isFileExists(lockFilePath)) {
    throw new Error(LOCKED_ERROR);
  }

  touchFile(lockFilePath);

  const args: string[] = [
    '-y',

    '-err_detect', 'ignore_err',
    '-fflags', '+discardcorrupt',

    '-i', filePath,
    ...getArgs(thumbType, size),
    '-r', TARGET_FRP.toString(),
  ];

  if (USE_PIX_FMT) {
    args.push('-pix_fmt');
    args.push('yuv420p');
  }

  if (REMOVE_AUDIO) {
    args.push('-an');
  }

  if (DURATION_SEC > 0) {
    args.push('-t');
    args.push(DURATION_SEC.toString());
  }

  args.push(outFilePath);

  let success = false;
  let output = '';

  try {
    const command = new Deno.Command(pathToFFMpeg, {
      args,
      stdout: 'piped',
      stderr: 'piped',
    });

    console.log('FFMpeg called with args:', args);

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
