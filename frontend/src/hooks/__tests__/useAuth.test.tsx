import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../../hooks/useAuth";
import { createAuthWrapper } from "../../tests/utils";

describe("useAuth", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("logs in a user", async () => {
    const wrapper = createAuthWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: "ava@storefront.dev", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.user?.email).toBe("ava@storefront.dev");
    });
  });

  it("logs out a user", async () => {
    const wrapper = createAuthWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: "ava@storefront.dev", password: "password123" });
    });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
