import { IDavManagers } from '../dav/createDavUsers.ts';
import { authGuard } from './middleware/authGuard.ts';
import { auth } from './routes/auth.ts';
import { getRootFolders } from './routes/getRootFolders.ts';
import { getFolderData } from './routes/getFolderData.ts';
import { checkThumb } from './routes/checkThumb.ts';
import { logger } from './middleware/logger.ts';
import { Application, Router } from '@oak/oak';
import { jsonBodyParser } from './middleware/jsonBodyParser.ts';
import { queryParser } from './middleware/queryParser.ts';
import { file } from './routes/file.ts';
import { mySession } from './routes/mySession.ts';
import { staticFiles } from './middleware/staticFiles.ts';
import { getThumb } from './routes/getThumb.ts';
import { getVideoPreview } from './routes/videoPreview.ts';
import { logout } from './routes/logout.ts';

export type IRootFoldersResponse = string | { rootFolders: string[] };

export function initHttp(
  app: Application,
  router: Router,
  davManagers: IDavManagers,
) {
  app.use(logger());

  app.use(staticFiles());

  app.use(authGuard());

  app.use(jsonBodyParser());

  app.use(queryParser());

  app.use(router.routes());

  app.use(router.allowedMethods());

  auth(router, davManagers);

  logout(router);

  mySession(router);

  getRootFolders(router);

  getFolderData(router);

  checkThumb(router);

  getThumb(router);

  getVideoPreview(router);

  file(router);
}
