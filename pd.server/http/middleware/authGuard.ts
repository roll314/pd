import {getUserSessionBySessionToken, removeExpiredUserSessions} from '../utils/userSessions.ts';
import { Context, Middleware, Next } from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';
import { USER_SESSION_COOKIE_KEY } from '../../../shared/authConst.ts';
import { removeAuthCookie } from '../utils/removeAuthCookie.ts';


export const authGuard = (): Middleware => async (ctx: Context, next: Next) => {
  if (ctx.request.url.pathname === '/api/auth') {
    await next();
    return;
  }

  const session = await ctx.cookies.get(USER_SESSION_COOKIE_KEY)

  if (!session) {
    ctx.response.status = 401;
    await removeAuthCookie(ctx);
    ctx.response.body = { error: 'no user session' } as CommonErrorResponse;

    return;
  }

  removeExpiredUserSessions();

  const foundUserSession = getUserSessionBySessionToken(session);

  if (!foundUserSession) {
    ctx.response.status = 401;
    await removeAuthCookie(ctx);
    ctx.response.body = { error: 'no user session found' } as CommonErrorResponse;

    return;
  }

  ctx.state.session = foundUserSession;

  await next();
};
