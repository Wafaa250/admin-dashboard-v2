import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="page">
      <h1 style="margin-bottom: 24px; font-size: 20px; font-weight: 600;">Overview</h1>

      <div *ngIf="loading" style="padding: 40px; color: #888;">Loading...</div>

      <ng-container *ngIf="!loading">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>{{ stats.totalProducts }}</h3>
            <p>Total Products</p>
          </div>
          <div class="stat-card">
            <h3>{{ stats.activeProducts }}</h3>
            <p>Active Products</p>
          </div>
          <div class="stat-card">
            <h3>{{ stats.totalOrders }}</h3>
            <p>Total Orders</p>
          </div>
          <div class="stat-card">
            <h3>{{ stats.totalRevenue | currency }}</h3>
            <p>Revenue</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="card">
            <h3 style="margin-bottom: 16px; font-size: 15px;">Orders</h3>
            <table>
              <tr>
                <td style="padding: 8px 0; color: #555;">Pending</td>
                <td style="padding: 8px 0; text-align: right;">{{ stats.pendingOrders }}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555;">Delivered</td>
                <td style="padding: 8px 0; text-align: right;">{{ stats.deliveredOrders }}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555;">Revenue</td>
                <td style="padding: 8px 0; text-align: right;">{{ stats.totalRevenue | currency }}</td>
              </tr>
            </table>
          </div>

          <div class="card">
            <h3 style="margin-bottom: 16px; font-size: 15px;">Inventory</h3>
            <table>
              <tr>
                <td style="padding: 8px 0; color: #555;">Active</td>
                <td style="padding: 8px 0; text-align: right;">{{ stats.activeProducts }}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555;">Inactive</td>
                <td style="padding: 8px 0; text-align: right;">{{ stats.totalProducts - stats.activeProducts }}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555;">Inventory Value</td>
                <td style="padding: 8px 0; text-align: right;">{{ stats.inventoryValue | currency }}</td>
              </tr>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
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
