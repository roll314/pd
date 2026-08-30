import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {LoginService} from './services/login.service';

@Component({
  selector: 'app-redirect',
  imports: [
    RouterOutlet
  ],
  template: `<router-outlet></router-outlet>`,
  host: {'class': 'layout'},
})
export class RedirectComponent implements OnInit {
  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit() {
    if (this.loginService.isLoggedIn) {
      this.router.navigate(['/files']);
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
