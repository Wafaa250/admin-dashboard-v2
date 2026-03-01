import { Component } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <h1>Admin Dashboard</h1>
        </div>
    
        @if (errorMsg) {
          <div class="error-alert">{{ errorMsg }}</div>
        }
    
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input
              type="text"
              formControlName="username"
              [class.invalid]="isInvalid('username')"
              />
            @if (isInvalid('username')) {
              <div class="error-msg">Required</div>
            }
          </div>
    
          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              formControlName="password"
              [class.invalid]="isInvalid('password')"
              />
            @if (isInvalid('password')) {
              <div class="error-msg">Required</div>
            }
          </div>
    
          <button
            type="submit"
            class="btn btn-primary"
            style="width:100%; padding: 10px; font-size: 15px; margin-top: 8px;"
            [disabled]="loading"
            >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
    `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    this.auth.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: Error) => { this.errorMsg = err.message; this.loading = false; }
    });
  }
}
