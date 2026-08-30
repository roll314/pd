import {ChangeDetectionStrategy, Component, Signal} from '@angular/core';
import {LoginService} from '../../services/login.service';
import {UserSessionInfo, UserSessionStoreService} from '../../services/user-session-store.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton
  ],
  standalone: true
})
export class CommonHeaderComponent {

  get userSessionInfo(): Signal<UserSessionInfo | undefined> {
    return this.userSessionStoreService.userSessionInfo?.asReadonly();
  }

  constructor(
    private loginService: LoginService,
    private userSessionStoreService: UserSessionStoreService,
  ) {
  }

  logout() {
    this.loginService.logout();
  }
}
