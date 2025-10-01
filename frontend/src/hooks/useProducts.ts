import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";
import { fetchProduct, fetchProducts } from "../api/products";
import type { PaginatedResponse, Product, ProductsQuery, Category } from "../types";

const PRODUCTS_QUERY_KEY = "products";
const PRODUCT_QUERY_KEY = "product";
const CATEGORIES_QUERY_KEY = "categories";

function serializeQuery(query: ProductsQuery): string {
  const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null);
  const sorted = entries.sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(sorted));
}

export function useProducts(query: ProductsQuery) {
  const serialized = useMemo(() => serializeQuery(query), [query]);

  return useQuery<PaginatedResponse<Product>>({
    queryKey: [PRODUCTS_QUERY_KEY, serialized],
    queryFn: () => fetchProducts(serialized ? (JSON.parse(serialized) as ProductsQuery) : {}),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30
  });
}

export function useProduct(productId: string) {
  return useQuery<Product>({
    queryKey: [PRODUCT_QUERY_KEY, productId],
    queryFn: () => fetchProduct(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60
  });
}
