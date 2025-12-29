import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import {Observable, of} from 'rxjs';
import {LoginService} from '../services/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticatedGuardService implements CanActivate {
  constructor(
    private loginService: LoginService,
  ) {}

  canActivate(_: ActivatedRouteSnapshot, __: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return of(this.loginService.isLoggedIn);
  }
}
