export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ProductFilter {
  search: string;
  category: string;
  status: string;
  sortBy: keyof Product;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
