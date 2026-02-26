import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth-module').then((m) => m.AuthModule)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
  {
  path: 'dashboard',
  loadChildren: () =>
    import('./features/dashboard/dashboard-module')
      .then(m => m.DashboardModule)
}
];