import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthRes} from '../model/api/auth-res';
import {AuthReq} from '../model/api/auth-req';
import {HttpClient} from '@angular/common/http';
import {UserSessionInfo} from '../services/user-session-store.service';

@Injectable({
  providedIn: 'root'
})
export class LoginApiService {

  constructor(
    private http: HttpClient,
  ) {
  }

  login(req: AuthReq): Observable<AuthRes> {
    return this.http.post<AuthRes>('/api/auth', req);
  }

  mySession(): Observable<UserSessionInfo> {
    return this.http.get<UserSessionInfo>('/api/mySession');
  }
}
