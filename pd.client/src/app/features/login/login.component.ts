import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {LoginService} from '../../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private loginService: LoginService,
  ) {
  }

  login() {
    this.loginService.login(this.username, this.password).subscribe();
  }
}
