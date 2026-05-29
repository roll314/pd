import { IUser } from 'npm:webdav-server@2.6.2/lib/user/v2/IUser.d.ts';

export interface IUserSession {
  user: IUser;
  expiredAt: Date;
  sessionToken: string;
}

let USER_SESSIONS: IUserSession[] = [];

export function addUserSession(userSession: IUserSession) {
  USER_SESSIONS.push(userSession);
}

export function getUserSessionBySessionToken(
  sessionToken: string,
): IUserSession | undefined {
  return USER_SESSIONS.find((session) => session.sessionToken === sessionToken);
}

export function removeUserSession(sessionToken: string) {
  return USER_SESSIONS = USER_SESSIONS.filter((session) => session.sessionToken !== sessionToken);
}

export function removeExpiredUserSessions() {
  USER_SESSIONS = USER_SESSIONS.filter((session) =>
    +session.expiredAt > Date.now()
  );
}
