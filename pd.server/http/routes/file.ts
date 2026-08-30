import { basename, join } from '@std/path';
import {isFileExists} from '../../thumb/isFileExists.ts';
import {findPhysicalPath} from '../../utils/findPhysicalPath.ts';
import {IUserSession} from '../utils/userSessions.ts';
import { Router } from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';


export interface IDownloadRequest {
  filePath: string;
  rootDirName: string;
  subPath: string;
  download: string;
}

export function file(router: Router) {
  router.get('/api/file', async ctx => {
    const query = ctx.state.query as IDownloadRequest;
    const userSession: IUserSession = ctx.state.session;

    const homeDirName = query.rootDirName;
    const homeDirPhysicalPath = findPhysicalPath(userSession.user.username, homeDirName);
    if (!homeDirPhysicalPath) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'home dir was not found' } as CommonErrorResponse;
      return;
    }

    const filePath = join(homeDirPhysicalPath, query.subPath, query.filePath);

    if (!await isFileExists(filePath)) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'target file does not exists' } as CommonErrorResponse;
      return;
    }

    const fileInfo = await Deno.stat(filePath);
    const fileSize = fileInfo.size;
    const fileName = basename(filePath);

    // Check for range headers
    const range = ctx.request.headers.get('range');

    if (range) {
      // Parse range header (e.g., "bytes=0-499")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      const file = await Deno.open(filePath, { read: true });
      const readable = file.readable;

      ctx.response.status = 206;
      ctx.response.headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      ctx.response.headers.set('Accept-Ranges', 'bytes');
      ctx.response.headers.set('Content-Length', chunkSize.toString());

      if (query.download) {
        ctx.response.headers.set('Content-Disposition', 'attachment');
        ctx.response.headers.set('filename', encodeURIComponent(fileName));
      }

      // Seek to the start position
      await file.seek(start, Deno.SeekMode.Start);
      ctx.response.body = readable;
    } else {
      const file = await Deno.open(filePath, { read: true });
      ctx.response.status = 200;
      ctx.response.headers.set('Content-Length', fileSize.toString());
      ctx.response.headers.set('Accept-Ranges', 'bytes');

      if (query.download) {
        ctx.response.headers.set('Content-Disposition', 'attachment');
        ctx.response.headers.set('filename', encodeURIComponent(fileName));
      }

      ctx.response.body = file.readable;
    }
  });
}
