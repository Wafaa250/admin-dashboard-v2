import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./products-list/products-list.component').then(m => m.ProductsListComponent),
    canActivate: [authGuard]
  }
];