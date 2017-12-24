import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {

  domain = 'http://localhost:8000';
  authtoken;
  options;
  user;

  constructor(
    private http: Http
  ) { }

  createAuthenticationHeaders() {
    this.loadToken();
    this.options = new RequestOptions({
      headers: new Headers({
        'Content-type': 'Application/json',
        'authorization': this.authtoken
      })
    });
  }

  loadToken() {
    const token = localStorage.getItem('token');
    this.authtoken = token;
  }

  registerUser(user) {
    return this.http.post(this.domain + '/authentication/register', user).map(res => res.json());
  }

  checkEmail(email) {
    return this.http.get(this.domain + '/authentication/checkEmail/' + email).map(res => res.json());
  }
  checkUsername(username) {
    return this.http.get(this.domain + '/authentication/checkUsername/' + username).map(res => res.json());
  }

  storeUserData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authtoken = token;
    this.user = user;
  }
  login(user) {
    return this.http.post(this.domain + '/authentication/login', user).map(res => res.json());
  }

  logout() {
    this.authtoken = null;
    this.user = null;
    localStorage.clear();
  }

  getProfile() {
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + '/authentication/profile', this.options).map(res => res.json());
  }

  loggedIn() {
    return tokenNotExpired();
  }
}
