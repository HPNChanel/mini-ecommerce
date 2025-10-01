import { apiClient } from "./client";
import type { Address, Order, OrderStatus } from "../types";

export async function fetchOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>("/orders");
  return response.data;
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function createOrder(address: Address): Promise<Order> {
  const response = await apiClient.post<Order>("/orders", { address });
  return response.data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await apiClient.patch<Order>(`/orders/${orderId}`, { status });
  return response.data;
}
