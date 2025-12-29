import {v4 as uuid} from 'npm:uuid@11.1.0';
import {addUserSession} from '../utils/userSessions.ts';
import {IDavManagers} from '../../dav/createDavUsers.ts';
import { Router } from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';

export interface IAuthRequest {
  username: string;
  password: string;
}

export interface IAuthResponse {
  sessionToken: string;
}

export function auth(router: Router, davManagers: IDavManagers) {
  router.post('/api/auth', async ctx => {
    const body = ctx.state.body as IAuthRequest;

    const userManager = davManagers.userManager;

    const foundUser = await userManager.getUserByNamePasswordPromise(body.username, body.password);
    if (!foundUser) {
      ctx.response.status = 401;
      ctx.response.body = { error: 'user not found' } as CommonErrorResponse;

      return;
    }

    const sessionToken = uuid();

    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const expiredAt = new Date(Date.now() + oneMonth);

    addUserSession({ sessionToken, expiredAt, user: foundUser });

    ctx.response.status = 200;
    ctx.response.body = { sessionToken } as IAuthResponse;
  });
}
