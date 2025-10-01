const API_URL_FALLBACK = "https://mock.api.local";

const rawApiUrl = import.meta.env.VITE_API_URL;
const rawUseMock = import.meta.env.VITE_USE_MOCK;
const rawMockSecret = import.meta.env.VITE_MOCKPAY_SECRET;

export const env = {
  apiUrl: typeof rawApiUrl === "string" && rawApiUrl.length > 0 ? rawApiUrl : API_URL_FALLBACK,
  useMock: rawUseMock !== "false",
  mockPaymentSecret:
    typeof rawMockSecret === "string" && rawMockSecret.length > 0 ? rawMockSecret : "demo-webhook-secret"
};
