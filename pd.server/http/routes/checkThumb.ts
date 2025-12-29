import * as path from '@std/path';
import {ThumbSize} from '../../../shared/thumbSize.ts';
import {getThumbFilePath} from '../../thumb/getThumbFilePath.ts';
import {getThumbFileHashSource} from '../../thumb/getThumbFileHashSource.ts';
import {isFileExists} from '../../thumb/isFileExists.ts';
import {findPhysicalPath} from '../../utils/findPhysicalPath.ts';
import {IUserSession} from '../utils/userSessions.ts';
import {isFileSupported} from '../../../shared/isFileSupported.ts';
import {generateThumb} from '../../dav/generateThumb.ts';
import {log, LogLevel, SystemPart} from '../../utils/log.ts';
import { Router } from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';
import { getConfig } from '../../config/getConfig.ts';

export interface ICheckThumbRequest {
  filePath: string;
  thumbSize: ThumbSize;
  rootDirName: string;
  subPath: string;
}

export function checkThumb(router: Router) {
  router.get('/api/checkThumb', async ctx => {
    const query = ctx.state.query as ICheckThumbRequest;

    const userSession: IUserSession = ctx.state.session;

    const homeDirName = query.rootDirName;
    const homeDirPhysicalPath = findPhysicalPath(userSession.user.username, homeDirName);
    if (!homeDirPhysicalPath) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'home dir was not found' } as CommonErrorResponse;

      return;
    }

    const filePath = path.join(homeDirPhysicalPath, query.subPath, query.filePath);

    if (!isFileSupported(filePath)) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'file type does not supported for thumb generation' } as CommonErrorResponse;

      return;
    }

    if (!await isFileExists(filePath)) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'target file does not exists' } as CommonErrorResponse;

      return;
    }

    const thumbPath = getThumbFilePath(getThumbFileHashSource(filePath, query.thumbSize));

    if (await isFileExists(thumbPath)) {
      ctx.response.status = 200;
      return;
    }

    try {
      await generateThumb(filePath);
    } catch (e) {
      log(`Cannot generate thumb for ${filePath}: ${(e as Error).message}`, LogLevel.LOG, SystemPart.THUMB);
      ctx.response.status = 500;
      ctx.response.body = { error: 'Cannot generate thumb' } as CommonErrorResponse;

      return;
    }

    ctx.response.status = 202;
  });
}
