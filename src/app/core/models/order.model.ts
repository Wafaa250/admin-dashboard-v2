export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  products: string[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderFilter {
  search: string;
  status: string;
  page: number;
  pageSize: number;
}
export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}