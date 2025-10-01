import { apiClient } from "./client";
import type { PaginatedResponse, Product, ProductsQuery } from "../types";

export async function fetchProducts(query: ProductsQuery): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>("/products", { params: query });
  return response.data;
}

export async function fetchProduct(productId: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${productId}`);
  return response.data;
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const response = await apiClient.post<Product>("/products", payload);
  return response.data;
}

export async function updateProduct(productId: string, payload: Partial<Product>): Promise<Product> {
  const response = await apiClient.patch<Product>(`/products/${productId}`, payload);
  return response.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}`);
}
