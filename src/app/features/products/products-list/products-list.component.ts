import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductFilter } from '../../../core/models/product.model';
import { ProductNameValidator } from '../product-name.validator';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h1 style="font-size:20px; font-weight:600;">Products</h1>
        <button class="btn btn-primary" (click)="openModal()">Add Product</button>
      </div>

      <div class="card">
        <div class="toolbar">
          <input type="text" placeholder="Search..." (input)="onSearch($event)" />
          <select (change)="onCategoryChange($event)">
            <option value="">All Categories</option>
            <option *ngFor="let cat of categories; trackBy: trackByValue" [value]="cat">{{ cat }}</option>
          </select>
          <select (change)="onStatusChange($event)">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th (click)="sort('id')"># {{ sortIcon('id') }}</th>
                <th (click)="sort('name')">Name {{ sortIcon('name') }}</th>
                <th (click)="sort('category')">Category {{ sortIcon('category') }}</th>
                <th (click)="sort('price')">Price {{ sortIcon('price') }}</th>
                <th (click)="sort('stock')">Stock {{ sortIcon('stock') }}</th>
                <th>Status</th>
                <th (click)="sort('createdAt')">Created {{ sortIcon('createdAt') }}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="8" style="padding:30px; color:#888;">Loading...</td>
              </tr>
              <tr *ngIf="!loading && products.length === 0">
                <td colspan="8" style="padding:30px; color:#888;">No products found</td>
              </tr>
              <tr *ngFor="let p of products; trackBy: trackById">
                <td>{{ p.id }}</td>
                <td>{{ p.name }}</td>
                <td>{{ p.category }}</td>
                <td>{{ p.price | currency }}</td>
                <td>{{ p.stock }}</td>
                <td>
                  <span [class]="'status status-' + p.status">{{ p.status }}</span>
                </td>
                <td>{{ p.createdAt }}</td>
                <td>
                  <button class="btn btn-sm" style="margin-right:4px;" (click)="openModal(p)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="delete(p)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" *ngIf="totalPages > 0">
          <button (click)="goPage(filter.page - 1)" [disabled]="filter.page === 1">‹</button>
          <button
            *ngFor="let p of pageNumbers; trackBy: trackByValue"
            (click)="goPage(p)"
            [class.active]="p === filter.page"
          >{{ p }}</button>
          <button (click)="goPage(filter.page + 1)" [disabled]="filter.page === totalPages">›</button>
          <span style="color:#888; font-size:13px; margin-left:6px;">Total: {{ total }}</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h3>
          <button (click)="closeModal()">×</button>
        </div>

        <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
          <div class="form-group">
            <label>Name</label>
            <input formControlName="name" [class.invalid]="isInvalid('name')" />
            <div class="error-msg" *ngIf="isInvalid('name')">
              <span *ngIf="productForm.get('name')?.errors?.['required']">Required</span>
              <span *ngIf="productForm.get('name')?.errors?.['nameTaken']">Name already exists</span>
            </div>
            <div style="font-size:12px; color:#888; margin-top:3px;" *ngIf="productForm.get('name')?.pending">
              Checking...
            </div>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select formControlName="category" [class.invalid]="isInvalid('category')">
              <option value="">Select</option>
              <option *ngFor="let cat of categories; trackBy: trackByValue" [value]="cat">{{ cat }}</option>
            </select>
            <div class="error-msg" *ngIf="isInvalid('category')">Required</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Price</label>
              <input type="number" formControlName="price" [class.invalid]="isInvalid('price')" />
              <div class="error-msg" *ngIf="isInvalid('price')">Required, must be > 0</div>
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input type="number" formControlName="stock" [class.invalid]="isInvalid('stock')" />
              <div class="error-msg" *ngIf="isInvalid('stock')">Required, must be >= 0</div>
            </div>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select formControlName="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || productForm.pending || saving">
              {{ saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductsListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  total = 0;
  totalPages = 0;
  loading = false;
  saving = false;
  showModal = false;
  editingProduct: Product | null = null;
  productForm!: FormGroup;
  categories: string[] = [];

  filter: ProductFilter = {
    search: '', category: '', status: '',
    sortBy: 'id', sortDir: 'desc', page: 1, pageSize: 10
  };

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private nameValidator: ProductNameValidator,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categories = this.productService.getCategories();
    this.loadProducts();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.filter = { ...this.filter, search: term, page: 1 };
      this.loadProducts();
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.filter).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.products = result.data;
      this.total = result.total;
      this.totalPages = Math.ceil(result.total / this.filter.pageSize);
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }
  onCategoryChange(e: Event): void { this.filter = { ...this.filter, category: (e.target as HTMLSelectElement).value, page: 1 }; this.loadProducts(); }
  onStatusChange(e: Event): void { this.filter = { ...this.filter, status: (e.target as HTMLSelectElement).value, page: 1 }; this.loadProducts(); }

  sort(col: keyof Product): void {
    const dir = this.filter.sortBy === col && this.filter.sortDir === 'asc' ? 'desc' : 'asc';
    this.filter = { ...this.filter, sortBy: col, sortDir: dir, page: 1 };
    this.loadProducts();
  }

  sortIcon(col: string): string {
    if (this.filter.sortBy !== col) return '';
    return this.filter.sortDir === 'asc' ? '▲' : '▼';
  }

  goPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.filter = { ...this.filter, page };
    this.loadProducts();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.filter.page - 2); i <= Math.min(this.totalPages, this.filter.page + 2); i++) pages.push(i);
    return pages;
  }

  openModal(product?: Product): void {
    this.editingProduct = product || null;
    this.productForm = this.fb.group({
      name: [product?.name || '', [Validators.required], [this.nameValidator.uniqueName(product?.id)]],
      category: [product?.category || '', Validators.required],
      price: [product?.price || '', [Validators.required, Validators.min(0.01)]],
      stock: [product?.stock ?? 0, [Validators.required, Validators.min(0)]],
      status: [product?.status || 'active']
    });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingProduct = null; }

  saveProduct(): void {
    if (this.productForm.invalid || this.productForm.pending) return;
    this.saving = true;
    const op$ = this.editingProduct
      ? this.productService.update(this.editingProduct.id, this.productForm.value)
      : this.productService.create(this.productForm.value);
    op$.subscribe({ next: () => { this.saving = false; this.closeModal(); this.loadProducts(); } });
  }

  delete(p: Product): void {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.productService.delete(p.id).subscribe(() => this.loadProducts());
  }

  isInvalid(f: string): boolean { const c = this.productForm.get(f); return !!(c?.invalid && (c?.touched || c?.dirty)); }
  trackById(_: number, item: Product): number { return item.id; }
  trackByValue(_: number, v: any): any { return v; }
}
