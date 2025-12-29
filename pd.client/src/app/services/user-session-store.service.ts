import {Injectable, signal, WritableSignal} from '@angular/core';

export interface User {
  uid: string;
  isAdministrator?: boolean;
  isDefaultUser?: boolean;
  username: string;
}

export interface UserSessionInfo {
  user: User;
  expiredAt: Date;
  sessionToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserSessionStoreService {
    userSessionInfo: WritableSignal<UserSessionInfo | undefined> = signal<UserSessionInfo | undefined>(undefined);
}
