import { renderHook, waitFor } from "@testing-library/react";
import { useProducts } from "../../hooks/useProducts";
import { createQueryClientWrapper } from "../../tests/utils";

describe("useProducts", () => {
  it("fetches products", async () => {
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useProducts({ page: 1, pageSize: 3, sort: "latest" }), { wrapper });

    await waitFor(() => {
      expect(result.current.data?.items.length).toBeGreaterThan(0);
    });
  });

  it("applies category filter", async () => {
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useProducts({ page: 1, pageSize: 12, category: "c2" }), { wrapper });

    await waitFor(() => {
      expect(result.current.data?.items.every((item) => item.categoryId === "c2")).toBe(true);
    });
  });
});
