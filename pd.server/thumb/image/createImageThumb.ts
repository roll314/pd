import { getThumbFilePath } from '../getThumbFilePath.ts';
import { isFileExists } from '../isFileExists.ts';
import { touchFile } from '../../utils/touch-file.ts';
import fs from 'node:fs';
import { log, LogLevel, SystemPart } from '../../utils/log.ts';
import { LOCKED_ERROR } from '../../dav/lockedError.ts';
import { ICreateThumbResult, THUMB_FILE_ALREADY_EXISTS_ERROR } from '../models/createThumbResult.ts';
import { ThumbType } from '../models/thumbType.ts';


const QUALITY = 80;

function getSquareThumbArgs(size: number): string[] {
  return [
    '-truecolors',
    '-out', 'jpeg',
    '-q', `${QUALITY}`,
    '-ratio',
    '-resize', 'shortest', `${size}`,
    '-canvas', `${size}`, `${size}`,
    'center'
  ];
}

function getProportionalThumbArgs(size: number): string[] {
  return [
    '-truecolors',
    '-out', 'jpeg',
    '-q', `${QUALITY}`,
    '-ratio',
    '-resize', `${size}`, `${size}`,
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

export async function createImageThumb(
  filePath: string,
  pathToNConvert: string,
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
    ...getArgs(thumbType, size),
    '-o', outFilePath,
    filePath,
  ];

  let success = false;
  let output = '';

  try {
    const command = new Deno.Command(pathToNConvert, {
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
    throw new Error(`Cannot run NConvert: ${e}`);
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
    throw new Error(`NConvert failed:\n${output}`);
  }
}
