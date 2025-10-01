import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, clearCart as clearCartRequest, fetchCart, removeCartItem, updateCartItem } from "../api/cart";
import { useAuth } from "./useAuth";
import type { CartSummary, Product } from "../types";
import { showErrorToast, showSuccessToast } from "../lib/toast";

interface AddItemInput {
  product: Product;
  quantity: number;
}

interface UpdateItemInput {
  itemId: string;
  quantity: number;
}

const CART_QUERY_KEY = ["cart"] as const;

function calculateSummary(items: CartSummary["items"]): Pick<CartSummary, "subtotal" | "tax" | "total"> {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    enabled: isAuthenticated,
    staleTime: 1000 * 30
  });

  const optimisticUpdate = useCallback(
    (updater: (current: CartSummary | undefined) => CartSummary | undefined) => {
      queryClient.setQueryData<CartSummary | undefined>(CART_QUERY_KEY, (current) => updater(current));
    },
    [queryClient]
  );

  const addMutation = useMutation({
    mutationFn: ({ product, quantity }: AddItemInput) => addToCart(product.id, quantity),
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<CartSummary>(CART_QUERY_KEY);
      optimisticUpdate((current) => {
        const base: CartSummary =
          current ?? {
            id: 0,
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            currency: "USD"
          };
        const existing = base.items.find((item) => item.productId === product.id);
        let items = base.items;
        if (existing) {
          items = base.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: Math.min(product.inventory, Math.max(1, item.quantity + quantity)) }
              : item
          );
        } else {
          items = [
            ...base.items,
            {
              id: `optimistic-${product.id}`,
              productId: product.id,
              quantity: Math.min(product.inventory, Math.max(1, quantity)),
              product
            }
          ];
        }
        const summary = calculateSummary(items);
        return { ...base, items, ...summary };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
      showSuccessToast("Added to cart");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: UpdateItemInput) => updateCartItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<CartSummary>(CART_QUERY_KEY);
      optimisticUpdate((current) => {
        if (!current) {
          return current;
        }
        const items = current.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.min(item.product.inventory, Math.max(1, quantity)) }
            : item
        );
        const summary = calculateSummary(items);
        return { ...current, items, ...summary };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<CartSummary>(CART_QUERY_KEY);
      optimisticUpdate((current) => {
        if (!current) {
          return current;
        }
        const items = current.items.filter((item) => item.id !== itemId);
        const summary = calculateSummary(items);
        return { ...current, items, ...summary };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    }
  });

  const clearMutation = useMutation({
    mutationFn: clearCartRequest,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<CartSummary>(CART_QUERY_KEY);
      const current = queryClient.getQueryData<CartSummary>(CART_QUERY_KEY);
      queryClient.setQueryData<CartSummary>(CART_QUERY_KEY, {
        id: current?.id ?? 0,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        currency: "USD"
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    }
  });

  const addItem = useCallback(
    async ({ product, quantity }: AddItemInput) => {
      if (!isAuthenticated) {
        showErrorToast("Please sign in to add items to your cart");
        throw new Error("Not authenticated");
      }
      await addMutation.mutateAsync({ product, quantity });
    },
    [addMutation, isAuthenticated]
  );

  const updateItem = useCallback(
    async ({ itemId, quantity }: UpdateItemInput) => {
      if (!isAuthenticated) {
        showErrorToast("Please sign in to manage your cart");
        throw new Error("Not authenticated");
      }
      await updateMutation.mutateAsync({ itemId, quantity });
    },
    [isAuthenticated, updateMutation]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!isAuthenticated) {
        showErrorToast("Please sign in to manage your cart");
        throw new Error("Not authenticated");
      }
      await removeMutation.mutateAsync(itemId);
    },
    [isAuthenticated, removeMutation]
  );

  const clear = useCallback(async () => {
    if (!isAuthenticated) {
      showErrorToast("Please sign in to manage your cart");
      throw new Error("Not authenticated");
    }
    await clearMutation.mutateAsync();
  }, [clearMutation, isAuthenticated]);

  return {
    cart: cartQuery.data ?? null,
    isLoading: cartQuery.isLoading,
    isFetching: cartQuery.isFetching,
    addItem,
    updateItem,
    removeItem,
    clear,
    isMutating: addMutation.isPending || updateMutation.isPending || removeMutation.isPending || clearMutation.isPending
  };
}
