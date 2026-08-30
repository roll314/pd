import { Routes } from '@angular/router';
import {AuthenticatedGuardService} from './guards/authenticated.guard.service';
import {NotAuthenticatedGuardService} from './guards/not-authenticated.guard.service';
import {LoginComponent} from './features/login/login.component';
import {FilesComponent} from './features/files/files.component';
import {UserSessionInfoResolver} from './route-resolvers/user-session-info-resolver';
import {RedirectComponent} from './redirect.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [NotAuthenticatedGuardService],
    component: LoginComponent
  },
  {
    path: '',
    resolve: { preloadData: UserSessionInfoResolver },
    component: RedirectComponent,
    children: [
      {
        path: 'files',
        canActivate: [AuthenticatedGuardService],

        children: [
          {
            path: '',
            loadChildren: () => import('./features/files/files.module').then(m => m.FilesModule),
            component: FilesComponent
          },
        ],
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
