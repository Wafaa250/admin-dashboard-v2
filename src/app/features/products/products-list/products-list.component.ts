import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductFilter } from '../../../core/models/product.model';
import { ProductNameValidator } from '../product-name.validator';

@Component({
  selector: 'app-products-list',
  imports: [CommonModule, ReactiveFormsModule, AgCharts],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsListComponent implements OnInit, OnDestroy {

  products:      Product[] = [];
  total          = 0;
  totalPages     = 0;
  loading        = false;
  saving         = false;
  showModal      = false;
  editingProduct: Product | null = null;
  productForm!:  FormGroup;
  categories:    string[] = [];
  chartOptions:  AgChartOptions = {};

  filter: ProductFilter = {
    search: '', category: '', status: '',
    sortBy: 'id', sortDir: 'desc', page: 1, pageSize: 10
  };

  private searchSubject = new Subject<string>();
  private destroy$      = new Subject<void>();

  constructor(
    private readonly productService: ProductService,
    private readonly nameValidator:  ProductNameValidator,
    private readonly fb:             FormBuilder,
    private readonly cdr:            ChangeDetectorRef
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
    this.productService.getProducts(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.products   = result.data;
        this.total      = result.total;
        this.totalPages = Math.ceil(result.total / this.filter.pageSize);
        this.loading    = false;
        this.updateChart();
        this.cdr.markForCheck();
      });
  }

  private updateChart(): void {
    this.productService.getStats().subscribe(stats => {
      this.chartOptions = {
        data: [
          { status: 'Active',   count: stats.active },
          { status: 'Inactive', count: stats.total - stats.active }
        ],
        series: [{
          type: 'pie',
          angleKey: 'count',
          calloutLabelKey: 'status',
          fills: ['#4fca8e', '#f76f6f'],
          strokes: ['#fff']
        }]
      };
      this.cdr.markForCheck();
    });
  }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }

  onCategoryChange(e: Event): void {
    this.filter = { ...this.filter, category: (e.target as HTMLSelectElement).value, page: 1 };
    this.loadProducts();
  }

  onStatusChange(e: Event): void {
    this.filter = { ...this.filter, status: (e.target as HTMLSelectElement).value, page: 1 };
    this.loadProducts();
  }

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
    for (let i = Math.max(1, this.filter.page - 2); i <= Math.min(this.totalPages, this.filter.page + 2); i++)
      pages.push(i);
    return pages;
  }

  openModal(product?: Product): void {
    this.editingProduct = product || null;
    this.productForm = this.fb.group({
      name:     [product?.name     || '', [Validators.required], [this.nameValidator.uniqueName(product?.id)]],
      category: [product?.category || '', Validators.required],
      price:    [product?.price    || '', [Validators.required, Validators.min(0.01)]],
      stock:    [product?.stock    ?? 0,  [Validators.required, Validators.min(0)]],
      status:   [product?.status   || 'active']
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

  isInvalid(f: string): boolean {
    const c = this.productForm.get(f);
    return !!(c?.invalid && (c?.touched || c?.dirty));
  }

  trackById(_: number, item: Product): number { return item.id; }
  trackByValue(_: number, v: any): any { return v; }
}