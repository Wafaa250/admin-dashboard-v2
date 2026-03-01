import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    @if (auth.isLoggedIn) {
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
    } @else {
      <router-outlet />
    }
    `
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout(): void { this.auth.logout(); this.router.navigate(['/auth/login']); }
}
