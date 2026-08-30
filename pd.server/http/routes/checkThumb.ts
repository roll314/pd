import * as path from '@std/path';
import {ThumbSize} from '../../../shared/thumbSize.ts';
import {getThumbFilePath} from '../../thumb/getThumbFilePath.ts';
import {getThumbFileHashSource} from '../../thumb/getThumbFileHashSource.ts';
import {isFileExists} from '../../thumb/isFileExists.ts';
import {findPhysicalPath} from '../../utils/findPhysicalPath.ts';
import {IUserSession} from '../utils/userSessions.ts';
import {isFileSupported} from '../../../shared/isFileSupported.ts';
import { Router } from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';
import {getThumbGenerationError, scheduleThumbGeneration} from '../../thumb/thumbGenerationJobs.ts';

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

    const generationError = getThumbGenerationError(filePath, query.thumbSize);
    if (generationError) {
      ctx.response.status = 500;
      ctx.response.body = {error: generationError.message} as CommonErrorResponse;
      return;
    }

    // Генерация выполняется в фоновой очереди. Клиент опросит этот endpoint повторно.
    scheduleThumbGeneration(filePath, query.thumbSize)
      .catch(() => undefined);
    ctx.response.headers.set('Retry-After', '1');
    ctx.response.status = 202;
  });
}
