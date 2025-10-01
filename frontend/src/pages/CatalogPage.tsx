import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/products/ProductCard";
import { useProducts, useCategories } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingState } from "../components/shared/LoadingState";

const PAGE_SIZE = 6;

export function CatalogPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { data: categories } = useCategories();

  const filters = useMemo(() => {
    const page = Number(searchParams.get("page") ?? "1");
    const sort = searchParams.get("sort") ?? "latest";
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    return {
      page: Number.isNaN(page) || page < 1 ? 1 : page,
      sort,
      search,
      category,
      minPrice: minPrice ?? "",
      maxPrice: maxPrice ?? ""
    };
  }, [searchParams]);

  const productsQuery = useProducts({
    page: filters.page,
    pageSize: PAGE_SIZE,
    sort: filters.sort as "price-asc" | "price-desc" | "latest",
    search: filters.search ? filters.search : undefined,
    category: filters.category ? filters.category : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined
  });

  const updateFilters = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!updates.page) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bg-slate-50">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Explore the collection</h1>
              <p className="text-sm text-slate-500">Search, filter, and sort to find your next favorite piece.</p>
            </div>
            <Button type="button" variant="outline" className="w-full rounded-full md:w-auto" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>

          <form className="grid gap-4 md:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Filter className="h-4 w-4" />
                Search
              </label>
              <Input
                value={filters.search}
                onChange={(event) => updateFilters({ search: event.target.value })}
                placeholder="Search by name or detail"
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <Select
                value={filters.category}
                onChange={(event) => updateFilters({ category: event.target.value })}
                className="mt-2 rounded-xl"
              >
                <option value="">All</option>
                {categories?.map((categoryItem) => (
                  <option key={categoryItem.id} value={categoryItem.id}>
                    {categoryItem.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <SlidersHorizontal className="h-4 w-4" />
                Sort by
              </label>
              <Select
                value={filters.sort}
                onChange={(event) => updateFilters({ sort: event.target.value })}
                className="mt-2 rounded-xl"
              >
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Min price</label>
                <Input
                  type="number"
                  value={filters.minPrice}
                  onChange={(event) => updateFilters({ minPrice: event.target.value })}
                  className="mt-2 rounded-xl"
                  min={0}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Max price</label>
                <Input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilters({ maxPrice: event.target.value })}
                  className="mt-2 rounded-xl"
                  min={0}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="mt-10">
          {productsQuery.isLoading ? (
            <LoadingState message="Loading products" />
          ) : productsQuery.data && productsQuery.data.items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {productsQuery.data.items.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={(item) => void addItem({ product: item, quantity: 1 })} />
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full px-4 py-2"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilters({ page: String(filters.page - 1) })}
                >
                  Previous
                </Button>
                <span className="text-slate-500">
                  Page {productsQuery.data.page} of {productsQuery.data.totalPages}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full px-4 py-2"
                  disabled={filters.page >= (productsQuery.data?.totalPages ?? 1)}
                  onClick={() => updateFilters({ page: String(filters.page + 1) })}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              title="No products match these filters"
              description="Try adjusting your filters or explore another category."
              action={
                <Button type="button" className="rounded-full" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
