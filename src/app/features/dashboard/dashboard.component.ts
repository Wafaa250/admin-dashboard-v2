import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats: any = {};

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      products: this.productService.getStats(),
      orders: this.orderService.getStats()
    }).subscribe(({ products, orders }) => {
      this.stats = {
        totalProducts: products.total,
        activeProducts: products.active,
        totalOrders: orders.total,
        pendingOrders: orders.pending,
        deliveredOrders: orders.delivered,
        totalRevenue: orders.revenue,
        inventoryValue: products.totalValue
      };
      this.loading = false;
      this.cdr.markForCheck();
    });
  }
}