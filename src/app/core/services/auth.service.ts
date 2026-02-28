import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginCredentials } from '../models/user.model';

const MOCK_USERS: User[] = [
  { id: 1, username: 'wafaa', email: 'wafaa@gmail.com', role: 'admin', token: 'token-wafaa-123' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private loadUser(): User | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  login(credentials: LoginCredentials): Observable<User> {
    const user = MOCK_USERS.find(
      u => u.username === credentials.username && credentials.password === 'wafaa123'
    );

    if (!user) {
      return throwError(() => new Error('Invalid username or password'));
    }

    return of(user).pipe(
      delay(800),
      tap(u => {
        localStorage.setItem('currentUser', JSON.stringify(u));
        this.currentUserSubject.next(u);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
