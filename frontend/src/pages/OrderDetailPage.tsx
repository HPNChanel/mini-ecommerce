import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchOrder } from "../api/orders";
import { LoadingState } from "../components/shared/LoadingState";
import { Button } from "../components/ui/button";

export function OrderDetailPage(): JSX.Element {
  const params = useParams();
  const orderId = params.orderId ?? "";
  const orderQuery = useQuery({ queryKey: ["orders", orderId], queryFn: () => fetchOrder(orderId), enabled: Boolean(orderId) });

  if (orderQuery.isLoading) {
    return <LoadingState message="Loading order" />;
  }

  if (!orderQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 py-20 text-center text-slate-600">
        <h1 className="text-2xl font-semibold text-slate-900">Order not found</h1>
        <p>The order you&apos;re looking for may have been archived or doesn&apos;t exist.</p>
        <Button asChild className="rounded-full">
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const order = orderQuery.data;

  return (
    <div className="bg-slate-50">
      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Order {order.id.slice(0, 8)}</h1>
            <p className="text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-sm text-slate-500">Status: <span className="capitalize">{order.status}</span></p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/orders">Back to orders</Link>
          </Button>
        </div>
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Shipping address</h2>
            <p className="text-sm text-slate-600">
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 ? <><br />{order.address.line2}</> : null}
              <br />
              {order.address.city}, {order.address.state} {order.address.postalCode}
              <br />
              {order.address.country}
            </p>
            <p className="text-sm text-slate-600">{order.address.email}</p>
            <p className="text-sm text-slate-600">{order.address.phone}</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{item.product.name}</p>
                  <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
