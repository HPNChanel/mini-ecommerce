export async function fetchHealth() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/healthz`);
    if (!response.ok) {
      throw new Error("Health check failed");
    }
    return response.json();
  } catch (error) {
    return { status: "offline" };
  }
}
