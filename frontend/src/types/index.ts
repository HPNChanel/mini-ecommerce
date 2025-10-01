export type Role = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  image: string;
  gallery: string[];
  inventory: number;
  featured: boolean;
  rating: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = "processing" | "fulfilled" | "cancelled";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: string;
  address: Address;
}

export interface ProductsQuery {
  search?: string;
  category?: string;
  sort?: "price-asc" | "price-desc" | "latest";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}
