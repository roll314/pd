import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {LoginService} from '../services/login.service';

@Injectable()
export class NotAuthSessionInterceptor implements HttpInterceptor {

  constructor(
    private loginService: LoginService,
  ) {
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          switch (err.status) {
            case 401:
              this.loginService.logout();
              break;
          }

          return throwError(() => err);
        })
      );
  }
}
