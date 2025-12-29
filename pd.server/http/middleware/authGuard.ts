  import {getUserSessionBySessionToken, removeExpiredUserSessions} from '../utils/userSessions.ts';
import { Context, Middleware, Next } from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';


export const authGuard = (): Middleware => async (ctx: Context, next: Next) => {
  if (ctx.request.url.pathname === '/api/auth') {
    await next();
    return;
  }

  const session = ctx.request.headers.get('session') ?? ctx.request.url.searchParams.get('session');

  if (!session) {
    ctx.response.status = 401;
    ctx.response.body = { error: 'no user session' } as CommonErrorResponse;

    return;
  }

  removeExpiredUserSessions();

  const foundUserSession = getUserSessionBySessionToken(session);

  if (!foundUserSession) {
    ctx.response.status = 401;
    ctx.response.body = { error: 'no user session found' } as CommonErrorResponse;

    return;
  }

  ctx.state.session = foundUserSession;

  await next();
};
