import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {LoginService} from '../services/login.service';

@Injectable({
  providedIn: 'root',
})
export class NotAuthenticatedGuardService implements CanActivate {
  constructor(
    private loginService: LoginService,
    private router: Router,
  ) {}

  canActivate(_: ActivatedRouteSnapshot, __: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (this.loginService.isLoggedIn) {
      this.router.navigate(['/files']);
      return of(false);
    } else {
      return of(true);
    }
  }
}
