import {User} from './user';

export interface UserSession {
  user: User;
  expiredAt: Date;
  sessionToken: string;
}
