import { apiClient } from "./client";
import type { CartSummary } from "../types";

export async function fetchCart(): Promise<CartSummary> {
  const response = await apiClient.get<CartSummary>("/cart");
  return response.data;
}

export async function addToCart(productId: string, quantity: number): Promise<CartSummary> {
  const response = await apiClient.post<CartSummary>("/cart", { productId, quantity });
  return response.data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartSummary> {
  const response = await apiClient.patch<CartSummary>(`/cart/${itemId}`, { quantity });
  return response.data;
}

export async function removeCartItem(itemId: string): Promise<CartSummary> {
  const response = await apiClient.delete<CartSummary>(`/cart/${itemId}`);
  return response.data;
}

export async function clearCart(): Promise<CartSummary> {
  const response = await apiClient.delete<CartSummary>("/cart");
  return response.data;
}
