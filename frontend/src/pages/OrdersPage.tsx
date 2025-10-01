import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/orders";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingState } from "../components/shared/LoadingState";
import { Button } from "../components/ui/button";

export function OrdersPage(): JSX.Element {
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  if (ordersQuery.isLoading) {
    return <LoadingState message="Loading orders" />;
  }

  if (!ordersQuery.data || ordersQuery.data.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <EmptyState
          title="No orders yet"
          description="When you place an order it will appear here with live updates."
          action={
            <Button asChild className="rounded-full">
              <Link to="/catalog">Shop now</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12 md:px-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Your orders</h1>
          <p className="text-sm text-slate-500">Track status and revisit order details.</p>
        </div>
        <div className="space-y-4">
          {ordersQuery.data.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-900 hover:shadow-md md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h2 className="text-base font-semibold text-slate-900">Order {order.id.slice(0, 8)}</h2>
                <p className="text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p className="font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                <p className="capitalize">Status: {order.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
