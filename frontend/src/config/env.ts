const API_URL_FALLBACK = "https://mock.api.local";

const rawApiUrl = import.meta.env.VITE_API_URL;
const rawUseMock = import.meta.env.VITE_USE_MOCK;

export const env = {
  apiUrl: typeof rawApiUrl === "string" && rawApiUrl.length > 0 ? rawApiUrl : API_URL_FALLBACK,
  useMock: rawUseMock !== "false"
};
