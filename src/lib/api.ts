// Central place for talking to the backend API.
// The base URL comes from the environment so it can change per environment.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch(`${API_URL}/api/health/`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`);
  }
  return res.json();
}
