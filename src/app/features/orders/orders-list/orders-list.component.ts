import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderFilter, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1 style="font-size:20px; font-weight:600; margin-bottom:20px;">Orders</h1>

      <div class="card">
        <div class="toolbar">
          <input type="text" placeholder="Search..." (input)="onSearch($event)" />
          <select (change)="onStatusChange($event)">
            <option value="">All Status</option>
            <option *ngFor="let s of statuses" [value]="s">{{ s | titlecase }}</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="orders.length === 0">
              <td colspan="7" style="padding:20px; color:#888;">No orders found</td>
            </tr>
            <tr *ngFor="let order of orders; trackBy: trackById">
              <td>#{{ order.id }}</td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.products.join(', ') }}</td>
              <td>{{ order.total | currency }}</td>
              <td>{{ order.status | titlecase }}</td>
              <td>{{ order.createdAt }}</td>
              <td>
                <select [(ngModel)]="order.status" (ngModelChange)="updateStatus(order, $event)"
                  style="padding:4px 8px; border:1px solid #ccc; border-radius:4px; font-size:13px;">
                  <option *ngFor="let s of statuses" [value]="s">{{ s | titlecase }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="totalPages > 1" style="margin-top:16px; display:flex; align-items:center; gap:10px; justify-content:center;">
          <button class="btn btn-sm" (click)="goPrev()" [disabled]="filter.page === 1">Prev</button>
          <span style="font-size:13px; color:#555;">Page {{ filter.page }} of {{ totalPages }}</span>
          <button class="btn btn-sm" (click)="goNext()" [disabled]="filter.page === totalPages">Next</button>
        </div>
      </div>
    </div>
  `
})
export class OrdersListComponent implements OnInit {

  orders: Order[] = [];
  total = 0;
  totalPages = 0;

  filter: OrderFilter = {
    search: '',
    status: '',
    page: 1,
    pageSize: 5
  };

  statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders(this.filter).subscribe(result => {
      this.orders = result.data;
      this.total = result.total;
      this.totalPages = Math.ceil(result.total / result.pageSize);
    });
  }

  onSearch(event: Event): void {
    this.filter.search = (event.target as HTMLInputElement).value;
    this.filter.page = 1;
    this.loadOrders();
  }

  onStatusChange(event: Event): void {
    this.filter.status = (event.target as HTMLSelectElement).value;
    this.filter.page = 1;
    this.loadOrders();
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.orderService.updateStatus(order.id, status).subscribe(updated => {
      order.status = updated.status;
    });
  }

  goPrev(): void {
    if (this.filter.page > 1) { this.filter.page--; this.loadOrders(); }
  }

  goNext(): void {
    if (this.filter.page < this.totalPages) { this.filter.page++; this.loadOrders(); }
  }

  trackById(_: number, order: Order): number { return order.id; }
}