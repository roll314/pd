import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';
import {map, Observable} from 'rxjs';
import {LoginService} from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class UserSessionInfoResolver implements Resolve<void> {
  constructor(
    private loginService: LoginService,
  ) {}

  resolve(): Observable<void> {
    return this.loginService.fetchUserSessionInfo().pipe(map(() => undefined) );
  }
}
