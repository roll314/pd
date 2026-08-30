import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import {provideRouter} from '@angular/router';
import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {NotAuthSessionInterceptor} from './interceptors/not-auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    provideRouter(routes),
    {provide: HTTP_INTERCEPTORS, useClass: NotAuthSessionInterceptor, multi: true},
  ]
};
