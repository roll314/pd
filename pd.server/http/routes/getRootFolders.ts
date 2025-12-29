import {getConfig} from '../../config/getConfig.ts';
import {IRootFoldersResponse} from '../initHttp.ts';
import {IDavUser} from '../../config/models.ts';
import {Router} from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';

export function getDavUser(username: string): IDavUser | undefined {
  const config = getConfig();
  return config.davServer.users.find(user => user.username === username);
}

export function getRootFolders(router: Router) {
  router.get('/api/rootFolders', ctx => {
    const userSession = ctx.state.session;

    const foundDavUser = getDavUser(userSession.user.username);
    if (!foundDavUser) {
      userSession.status = 404;
      userSession.body = {error: 'No DAV user found'} as CommonErrorResponse;

      return;
    }

    const rootFolders = foundDavUser.rootDirectories.map(dir => dir.name);

    ctx.response.status = 200;
    ctx.response.body = {rootFolders} as IRootFoldersResponse;
  });
}
