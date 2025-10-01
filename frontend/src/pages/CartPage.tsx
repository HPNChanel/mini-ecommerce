import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { EmptyState } from "../components/shared/EmptyState";
import { useCart } from "../hooks/useCart";

export function CartPage(): JSX.Element {
  const { cart, isLoading, updateItem, removeItem } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl justify-center px-4 py-20">
        <p className="text-slate-500">Loading cart…</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16">
        <EmptyState
          title="Your cart is feeling light"
          description="Start exploring our catalog to add thoughtful pieces to your cart."
          action={
            <Button asChild className="rounded-full">
              <Link to="/catalog">Shop catalog</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-[2fr_1fr] md:px-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900">Your cart</h1>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{item.product.name}</h2>
                    <p className="text-sm text-slate-500">${item.product.price.toFixed(2)}</p>
                    <button
                      type="button"
                      className="mt-1 text-sm font-medium text-slate-500 underline-offset-4 hover:underline"
                      onClick={() => void removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor={`quantity-${item.id}`} className="text-sm text-slate-500">
                    Qty
                  </label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min={1}
                    max={item.product.inventory}
                    value={item.quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (!Number.isNaN(value)) {
                        void updateItem({ itemId: item.id, quantity: value });
                      }
                    }}
                    className="w-24 rounded-full"
                  />
                  <span className="text-sm font-semibold text-slate-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-full bg-white px-6 py-4 text-sm text-slate-500">
            <span>Total items</span>
            <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
        </div>

        <aside className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated tax</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
          <Button asChild className="rounded-full py-3 text-base font-semibold">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
        </aside>
      </section>
    </div>
  );
}
