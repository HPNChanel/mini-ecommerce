import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/products/ProductCard";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingState } from "../components/shared/LoadingState";

export function HomePage(): JSX.Element {
  const { data: featuredProducts, isLoading } = useProducts({ page: 1, pageSize: 3, sort: "latest" });
  const { addItem } = useCart();

  return (
    <div className="bg-slate-50">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-20 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="max-w-xl space-y-6">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Minimal store kit
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Objects that spark joy in the everyday
          </h1>
          <p className="text-base text-slate-600">
            Discover a curated edit of wardrobe staples and home essentials made with elevated materials and sustainable intent.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-6 py-3 text-base font-semibold">
              <Link to="/catalog" className="flex items-center gap-2">
                Shop collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6 py-3 text-base font-semibold">
              <Link to="/about">Our story</Link>
            </Button>
          </div>
        </div>
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="grid gap-4 text-sm text-slate-500">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Design notes</p>
              <p className="text-base font-medium text-slate-900">Honest silhouettes, responsible materials, enduring quality.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 p-6 text-slate-100">
              <p className="text-sm text-slate-200">
                "Each release is a love letter to slow living. Every detail is refined so you can focus on what matters—feeling at home."
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span>Free shipping over $150</span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">New arrivals weekly</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Featured pieces</h2>
            <p className="text-sm text-slate-500">Handpicked designs the community is loving right now.</p>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full px-4 py-2 text-sm font-medium md:flex">
            <Link to="/catalog">View all</Link>
          </Button>
        </div>
        {isLoading ? (
          <LoadingState message="Curating featured pieces" />
        ) : featuredProducts && featuredProducts.items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={(item) => void addItem({ product: item, quantity: 1 })} />
            ))}
          </div>
        ) : (
          <EmptyState title="No featured products yet" description="Check back soon for new arrivals." />
        )}
      </section>
    </div>
  );
}
