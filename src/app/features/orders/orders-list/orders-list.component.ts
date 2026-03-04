import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderFilter, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss'
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