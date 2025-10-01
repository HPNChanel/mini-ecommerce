import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { useProduct, useProducts, useCategories } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { Button } from "../components/ui/button";
import { LoadingState } from "../components/shared/LoadingState";
import { ProductCard } from "../components/products/ProductCard";

export function ProductDetailPage(): JSX.Element {
  const params = useParams();
  const productId = params.productId ?? "";
  const productQuery = useProduct(productId);
  const relatedQuery = useProducts({ page: 1, pageSize: 3, sort: "latest" });
  const categoriesQuery = useCategories();
  const { addItem } = useCart();

  const product = productQuery.data;

  const relatedProducts = useMemo(() => {
    if (!relatedQuery.data || !product) {
      return [];
    }
    return relatedQuery.data.items.filter((item) => item.id !== product.id).slice(0, 3);
  }, [relatedQuery.data, product]);

  if (productQuery.isLoading) {
    return <LoadingState message="Loading product" />;
  }

  if (!product) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 py-20 text-center text-slate-600">
        <h1 className="text-2xl font-semibold text-slate-900">We couldn&apos;t find that product</h1>
        <p>Please return to the catalog to keep exploring the collection.</p>
        <Button asChild className="rounded-full">
          <Link to="/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6">
        <div className="space-y-4">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/catalog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to catalog
            </Link>
          </Button>
          <div className="grid gap-4">
            {product.gallery.map((image) => (
              <div key={image} className="overflow-hidden rounded-3xl border border-slate-200">
                <img src={image} alt={product.name} className="w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500">
              Category: {categoriesQuery.data?.find((item) => item.id === product.categoryId)?.name ?? "Collection"}
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="text-2xl font-semibold text-slate-900">${product.price.toFixed(2)}</span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                {product.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                {product.inventory > 0 ? "In stock" : "Out of stock"}
              </span>
            </div>
          </div>
          <p className="text-base leading-relaxed text-slate-600">{product.description}</p>
          <div className="rounded-2xl bg-slate-100 p-6 text-sm text-slate-600">
            <h2 className="text-base font-semibold text-slate-900">Material &amp; care</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Crafted from responsible supply chain partners</li>
              <li>Machine wash cold and lay flat to dry</li>
              <li>Ships in recyclable packaging</li>
            </ul>
          </div>
          <Button
            type="button"
            className="rounded-full bg-slate-900 py-3 text-base font-semibold"
            onClick={() => void addItem({ product, quantity: 1 })}
          >
            Add to cart - ${product.price.toFixed(2)}
          </Button>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
          <div className="flex items-center justify-between pb-6">
            <h2 className="text-2xl font-semibold text-slate-900">You may also like</h2>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/catalog">View all</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} onAddToCart={(item) => void addItem({ product: item, quantity: 1 })} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
