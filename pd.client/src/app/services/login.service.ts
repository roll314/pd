import {Injectable} from '@angular/core';
import {catchError, filter, map, NEVER, Observable, of, tap} from 'rxjs';
import {LoginApiService} from '../api/login-api.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {AuthRes} from '../model/api/auth-res';
import {UserSessionInfo, UserSessionStoreService} from './user-session-store.service';

const USER_SESSION_STORAGE_KEY = 'userSession';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  get isLoggedIn(): boolean {
    return !!this.userSession;
  }

  get userSession(): string | undefined | null {
    return localStorage.getItem(USER_SESSION_STORAGE_KEY);
  }

  constructor(
    private loginApiService: LoginApiService,
    private userSessionStoreService: UserSessionStoreService,
    private matSnackBar: MatSnackBar,
    private router: Router,
  ) {
  }

  login(username: string, password: string): Observable<void> {
    return this.loginApiService.login({username, password })
      .pipe(
        catchError(() => {
          this.matSnackBar.open('Wrong username or password', undefined, {duration: 3000});
          return NEVER;
        }),
        tap((res: AuthRes) => {
          localStorage.setItem(USER_SESSION_STORAGE_KEY, res.sessionToken);
          this.router.navigate(['files']);
        }),
        map(() => undefined)
      );
  }

  logout() {
    localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    this.router.navigate(['/auth']);
  }

  fetchUserSessionInfo(): Observable<UserSessionInfo | null> {
    if (!this.isLoggedIn) {
      return of(null);
    }

    return this.loginApiService.mySession()
      .pipe(
        catchError(() => {
          this.matSnackBar.open('Cannot fetch user session', undefined, {duration: 3000});
          return NEVER;
        }),
        tap((info: UserSessionInfo) => this.userSessionStoreService.userSessionInfo.set(info)),
      );
  }
}
