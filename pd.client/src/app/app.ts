import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {CommonModule} from '@angular/common';
import {CommonHeaderComponent} from './features/common-header/common-header.component';
import {LoginService} from './services/login.service';
import {IconsModule} from './icons/icons.module';

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    CommonModule,
    CommonHeaderComponent,
    IconsModule
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {

  get isLoggedIn(): boolean {
    return this.loginService.isLoggedIn;
  }

  constructor(
    private loginService: LoginService,
  ) {
  }
}
