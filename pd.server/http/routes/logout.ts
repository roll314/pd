import { Router } from '@oak/oak';
import { IUserSession, removeUserSession } from '../utils/userSessions.ts';
import { removeAuthCookie } from '../utils/removeAuthCookie.ts';

export function logout(router: Router) {
  router.post('/api/logout', async ctx => {

    const userSession: IUserSession = ctx.state.session;

    removeUserSession(userSession.sessionToken);

    await removeAuthCookie(ctx);

    ctx.response.status = 202;
  });
}
