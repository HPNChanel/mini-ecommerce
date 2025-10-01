import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import type { Product } from "../../types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps): JSX.Element {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.featured ? (
          <Badge className="absolute left-3 top-3 bg-slate-900 text-white">Featured</Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
            <span className="text-sm font-medium text-slate-600">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <p
            className="text-sm text-slate-500"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {product.description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
          <span>In stock: {product.inventory}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="flex-1 rounded-full">
            <Link to={`/products/${product.id}`} className="flex items-center justify-center gap-1">
              View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {onAddToCart ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onAddToCart(product)}
            >
              Add
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
