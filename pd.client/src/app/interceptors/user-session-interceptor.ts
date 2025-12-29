import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {LoginService} from '../services/login.service';

@Injectable()
export class UserSessionInterceptor implements HttpInterceptor {
  constructor(
    private loginService: LoginService,
  ) {
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req.clone({ setHeaders: { session: this.loginService.userSession ?? '' } }));
  }
}
