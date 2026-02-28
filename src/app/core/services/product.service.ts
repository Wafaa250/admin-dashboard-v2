import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, ProductFilter, PagedResult } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private products: Product[] = [
    { id: 1, name: 'T-Shirt', category: 'Clothing', price: 20, stock: 10, status: 'active', createdAt: '2025-01-01' },
    { id: 2, name: 'Jeans', category: 'Clothing', price: 50, stock: 8, status: 'active', createdAt: '2025-01-02' },
    { id: 3, name: 'Jacket', category: 'Clothing', price: 80, stock: 5, status: 'active', createdAt: '2025-01-03' },
    { id: 4, name: 'Hoodie', category: 'Clothing', price: 40, stock: 12, status: 'inactive', createdAt: '2025-01-04' },
    { id: 5, name: 'Dress', category: 'Clothing', price: 60, stock: 6, status: 'active', createdAt: '2025-01-05' },
    { id: 6, name: 'Skirt', category: 'Clothing', price: 35, stock: 7, status: 'active', createdAt: '2025-01-06' },
    { id: 7, name: 'Blouse', category: 'Clothing', price: 25, stock: 9, status: 'active', createdAt: '2025-01-07' },
    { id: 8, name: 'Coat', category: 'Clothing', price: 100, stock: 4, status: 'inactive', createdAt: '2025-01-08' },
    { id: 9, name: 'Shorts', category: 'Clothing', price: 30, stock: 11, status: 'active', createdAt: '2025-01-09' },
    { id: 10, name: 'Sweater', category: 'Clothing', price: 45, stock: 6, status: 'active', createdAt: '2025-01-10' }
  ];

  // ======================
  // GET PRODUCTS
  // ======================

  getProducts(filter: ProductFilter): Observable<PagedResult<Product>> {

    let result = [...this.products];

    // Search
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filter.category) {
      result = result.filter(p => p.category === filter.category);
    }

    // Status filter
    if (filter.status) {
      result = result.filter(p => p.status === filter.status);
    }

    // Sorting
    if (filter.sortBy) {
      result.sort((a: any, b: any) => {
        const dir = filter.sortDir === 'desc' ? -1 : 1;
        return a[filter.sortBy] > b[filter.sortBy] ? dir : -dir;
      });
    }

    const total = result.length;

    const start = (filter.page - 1) * filter.pageSize;
    const data = result.slice(start, start + filter.pageSize);

    return of({
      data,
      total,
      page: filter.page,
      pageSize: filter.pageSize
    });
  }

  // ======================
  // CRUD
  // ======================

  create(product: Omit<Product, 'id' | 'createdAt'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: this.products.length + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.products.push(newProduct);
    return of(newProduct);
  }

  update(id: number, data: Partial<Product>): Observable<Product> {
    const index = this.products.findIndex(p => p.id === id);
    this.products[index] = { ...this.products[index], ...data };
    return of(this.products[index]);
  }

  delete(id: number): Observable<boolean> {
    this.products = this.products.filter(p => p.id !== id);
    return of(true);
  }

  // ======================
  // VALIDATION
  // ======================

  checkNameExists(name: string, excludeId?: number): Observable<boolean> {
    const exists = this.products.some(
      p =>
        p.name.toLowerCase() === name.toLowerCase() &&
        p.id !== excludeId
    );
    return of(exists);
  }

  getCategories(): string[] {
    return ['Clothing'];
  }

  // ======================
  // DASHBOARD STATS
  // ======================

  getStats(): Observable<{ total: number; active: number; totalValue: number }> {

    const total = this.products.length;

    const active = this.products.filter(p =>
      p.status === 'active'
    ).length;

    const totalValue = this.products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    );

    return of({ total, active, totalValue });
  }
}