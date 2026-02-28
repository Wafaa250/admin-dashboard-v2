import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <ng-container *ngIf="auth.isLoggedIn; else noLayout">
      <div class="layout">
        <aside class="sidebar">
          <div class="logo">Admin</div>
          <nav>
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/products" routerLinkActive="active">Products</a>
            <a routerLink="/orders" routerLinkActive="active">Orders</a>
          </nav>
        </aside>
        <div class="main-content">
          <div class="topbar">
            <h2>Admin Dashboard</h2>
            <div class="user-info">
              <span>{{ auth.currentUser?.username }}</span>
              <button (click)="logout()">Logout</button>
            </div>
          </div>
          <router-outlet />
        </div>
      </div>
    </ng-container>
    <ng-template #noLayout>
      <router-outlet />
    </ng-template>
  `
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout(): void { this.auth.logout(); this.router.navigate(['/auth/login']); }
}
