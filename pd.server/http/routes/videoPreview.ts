import * as path from '@std/path';
import {ThumbSize} from '../../../shared/thumbSize.ts';
import {getThumbFileHashSource} from '../../thumb/getThumbFileHashSource.ts';
import {isFileExists} from '../../thumb/isFileExists.ts';
import {findPhysicalPath} from '../../utils/findPhysicalPath.ts';
import {IUserSession} from '../utils/userSessions.ts';
import {Router} from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';
import { getVideoPreviewFilePath } from '../../thumb/getVideoPreviewFilePath.ts';
import { getEtag } from '../utils/getEtag.ts';

export interface IGetVideoPreviewRequest {
  filePath: string;
  thumbSize: ThumbSize;
  rootDirName: string;
  subPath: string;
}

export function getVideoPreview(router: Router) {
  router.get('/api/videoPreview', async ctx => {
    const query = ctx.state.query as IGetVideoPreviewRequest;

    const userSession: IUserSession = ctx.state.session;

    const homeDirName = query.rootDirName;
    const homeDirPhysicalPath = findPhysicalPath(userSession.user.username, homeDirName);
    if (!homeDirPhysicalPath) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'home dir was not found' } as CommonErrorResponse;

      return;
    }

    const filePath = path.join(homeDirPhysicalPath, query.subPath, query.filePath);

    const thumbPath = getVideoPreviewFilePath(getThumbFileHashSource(filePath, query.thumbSize));

    if (!await isFileExists(thumbPath)) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'preview file does not exists' } as CommonErrorResponse;

      return;
    }

    const fileInfo = await Deno.stat(thumbPath);
    const fileSize = fileInfo.size;

    const etag = await getEtag(thumbPath);
    if (etag) {
      ctx.response.headers.set("etag", etag);
    }

    // Check for range headers
    const range = ctx.request.headers.get('range');

    if (range) {
      // Parse range header (e.g., "bytes=0-499")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      const file = await Deno.open(thumbPath, { read: true });
      const readable = file.readable;

      ctx.response.status = 206;
      ctx.response.headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      ctx.response.headers.set('Accept-Ranges', 'bytes');
      ctx.response.headers.set('Content-Length', chunkSize.toString());

      // Seek to the start position
      await file.seek(start, Deno.SeekMode.Start);
      ctx.response.body = readable;
    } else {
      const file = await Deno.open(thumbPath, { read: true });
      ctx.response.status = 200;
      ctx.response.headers.set('Content-Length', fileSize.toString());
      ctx.response.headers.set('Accept-Ranges', 'bytes');

      ctx.response.body = file.readable;
    }
  });
}
