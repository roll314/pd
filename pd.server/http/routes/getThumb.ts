import * as path from '@std/path';
import {ThumbSize} from '../../../shared/thumbSize.ts';
import {getThumbFilePath} from '../../thumb/getThumbFilePath.ts';
import {getThumbFileHashSource} from '../../thumb/getThumbFileHashSource.ts';
import {isFileExists} from '../../thumb/isFileExists.ts';
import {findPhysicalPath} from '../../utils/findPhysicalPath.ts';
import {IUserSession} from '../utils/userSessions.ts';
import {Router} from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';
import { getConfig } from '../../config/getConfig.ts';
import { getEtag } from '../utils/getEtag.ts';

export interface IGetThumbRequest {
  filePath: string;
  thumbSize: ThumbSize;
  rootDirName: string;
  subPath: string;
}

export function getThumb(router: Router) {
  router.get('/api/thumb', async ctx => {
    const query = ctx.state.query as IGetThumbRequest;

    const userSession: IUserSession = ctx.state.session;

    const homeDirName = query.rootDirName;
    const homeDirPhysicalPath = findPhysicalPath(userSession.user.username, homeDirName);
    if (!homeDirPhysicalPath) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'home dir was not found' } as CommonErrorResponse;

      return;
    }

    const filePath = path.join(homeDirPhysicalPath, query.subPath, query.filePath);

    const thumbPath = getThumbFilePath(getThumbFileHashSource(filePath, query.thumbSize));

    if (!await isFileExists(thumbPath)) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'thumb file does not exists' } as CommonErrorResponse;

      return;
    }

    const config = getConfig();
    const thumbCacheIntervalSec = config.httpsServer.thumbCacheIntervalSec;
    const fileInfo = await Deno.stat(thumbPath);
    const etag = await getEtag(thumbPath);

    if (etag) {
      ctx.response.headers.set("etag", etag);
    }
    ctx.response.headers.set('Cache-Control', `private, max-age=${thumbCacheIntervalSec}, immutable`);
    ctx.response.headers.set('Expires', new Date(Date.now() + thumbCacheIntervalSec * 1000).toUTCString());
    ctx.response.headers.set('Content-Type', 'image/jpeg');

    const ifNoneMatch = ctx.request.headers.get('if-none-match');
    const requestedEtags = ifNoneMatch?.split(',').map(value => value.trim()) ?? [];
    if (etag && (requestedEtags.includes(etag) || requestedEtags.includes('*'))) {
      // При совпадении валидатора тело файла не передаётся повторно.
      ctx.response.status = 304;
      return;
    }

    ctx.response.headers.set('Content-Length', fileInfo.size.toString());
    const filestream = await Deno.open(thumbPath, { read: true });
    ctx.response.status = 200;
    ctx.response.body = filestream.readable;
  });
}
