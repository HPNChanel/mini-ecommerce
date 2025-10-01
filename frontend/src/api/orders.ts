import { apiClient } from "./client";
import { env } from "../config/env";
import type { Order, OrderStatus } from "../types";

interface CheckoutResponseApi {
  order_id: number;
  payment_ref: string;
  client_secret: string;
}

export interface CheckoutResponse {
  orderId: number;
  paymentRef: string;
  clientSecret: string;
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>("/orders");
  return response.data;
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function checkoutCart(cartId: number): Promise<CheckoutResponse> {
  const response = await apiClient.post<CheckoutResponseApi>("/checkout", { cart_id: cartId });
  const data = response.data;
  return { orderId: data.order_id, paymentRef: data.payment_ref, clientSecret: data.client_secret };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await apiClient.patch<Order>(`/orders/${orderId}`, { status });
  return response.data;
}

export async function confirmMockPayment(paymentRef: string): Promise<Order> {
  const response = await apiClient.post<Order>(
    "/webhooks/mock-payments",
    { payment_ref: paymentRef },
    { headers: { "x-mockpay-signature": env.mockPaymentSecret } }
  );
  return response.data;
}
