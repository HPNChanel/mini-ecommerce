import { act, renderHook, waitFor } from "@testing-library/react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { fetchProduct } from "../../api/products";
import { createAuthWrapper } from "../../tests/utils";

describe("useCart", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds an item to the cart", async () => {
    const wrapper = createAuthWrapper();
    const { result } = renderHook(() => ({ auth: useAuth(), cart: useCart() }), { wrapper });

    await act(async () => {
      await result.current.auth.login({ email: "ava@storefront.dev", password: "password123" });
    });

    const product = await fetchProduct("p1");

    await act(async () => {
      await result.current.cart.addItem({ product, quantity: 1 });
    });

    await waitFor(() => {
      expect(result.current.cart.cart?.items[0]?.productId).toBe("p1");
    });
  });
});
