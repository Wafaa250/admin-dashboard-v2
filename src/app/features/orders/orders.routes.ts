import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/auth.guard';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./orders-list/orders-list.component').then(m => m.OrdersListComponent),
    canActivate: [adminGuard]
  }
];