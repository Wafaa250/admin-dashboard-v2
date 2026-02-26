import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private fakeUser = {
    email: 'wafaa250@gmail.com',
    password: '12345'
  };

  login(email: string, password: string): boolean {

    if (
      email === this.fakeUser.email &&
      password === this.fakeUser.password
    ) {
      //create token
      localStorage.setItem('token', 'admin-token');
      return true;
    }

    return false;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}