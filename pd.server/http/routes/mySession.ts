import {IUserSession} from '../utils/userSessions.ts';
import {WithoutNestedField} from '../../utils/without-nested-field.ts';
import { Router } from '@oak/oak';

export type MySessionResponse = WithoutNestedField<IUserSession, 'user', 'password'>;

export function mySession(router: Router) {
  router.get('/api/mySession', ctx => {
    const result: MySessionResponse = {
      ...ctx.state.session,
      user: {
        ...ctx.state.session.user,
        password: undefined,
      }
    };

    ctx.response.status = 200;
    ctx.response.body = result;
  });
}
