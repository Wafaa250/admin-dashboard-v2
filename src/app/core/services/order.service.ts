import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Order, OrderFilter, OrderStatus, PagedResult } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
private orders: Order[] = [
  { id: 1, customerName: 'Ahmad', customerEmail: 'ahmad@mail.com', products: ['T-Shirt'], total: 20, status: 'pending', createdAt: '2025-01-01' },
  { id: 2, customerName: 'Sara', customerEmail: 'sara@mail.com', products: ['Jeans'], total: 50, status: 'delivered', createdAt: '2025-01-02' },
  { id: 3, customerName: 'Omar', customerEmail: 'omar@mail.com', products: ['T-Shirt', 'Shorts'], total: 50, status: 'shipped', createdAt: '2025-01-03' },
  { id: 4, customerName: 'Lina', customerEmail: 'lina@mail.com', products: ['Jacket', 'Jeans'], total: 130, status: 'shipped', createdAt: '2025-01-04' },
  { id: 5, customerName: 'Ali', customerEmail: 'ali@mail.com', products: ['Hoodie'], total: 40, status: 'pending', createdAt: '2025-01-05' },
  { id: 6, customerName: 'Maya', customerEmail: 'maya@mail.com', products: ['Dress'], total: 60, status: 'delivered', createdAt: '2025-01-06' },
  { id: 7, customerName: 'Yousef', customerEmail: 'yousef@mail.com', products: ['Coat'], total: 100, status: 'processing', createdAt: '2025-01-07' },
  { id: 8, customerName: 'Noor', customerEmail: 'noor@mail.com', products: ['Blouse', 'Skirt'], total: 60, status: 'shipped', createdAt: '2025-01-08' },
  { id: 9, customerName: 'Hala', customerEmail: 'hala@mail.com', products: ['Sweater'], total: 45, status: 'pending', createdAt: '2025-01-09' },
  { id: 10, customerName: 'Adam', customerEmail: 'adam@mail.com', products: ['Jacket'], total: 80, status: 'delivered', createdAt: '2025-01-10' }
];

  getOrders(filter: OrderFilter): Observable<PagedResult<Order>> {

    let result = this.orders;

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(o =>
        o.customerName.toLowerCase().includes(q)
      );
    }

    if (filter.status) {
      result = result.filter(o => o.status === filter.status);
    }

    const total = result.length;

    const start = (filter.page - 1) * 5;
    const data = result.slice(start, start + 5);

    return of({
      data,
      total,
      page: filter.page,
      pageSize: 5
    });
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    const order = this.orders.find(o => o.id === id);
    if (order) order.status = status;
    return of(order!);
  }

getStats(): Observable<{ total: number; pending: number; delivered: number; revenue: number }> {
  const total = this.orders.length;
  const pending = this.orders.filter(o => o.status === 'pending').length;
  const delivered = this.orders.filter(o => o.status === 'delivered').length;
  const revenue = this.orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  return of({ total, pending, delivered, revenue });
}

}