/**
 * Fetches read-only public catalog resources through Vercel's edge-cached
 * `/api/public-catalog` endpoint in production builds, returning null so callers
 * seamlessly fall back to direct Supabase queries in dev, tests, or on fallback.
 */
export async function fetchPublicCatalog<T>(
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<T | null> {
  if (!import.meta.env.PROD || typeof window === 'undefined') {
    return null;
  }

  try {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    }

    const response = await fetch(`/api/public-catalog?${search.toString()}`, {
      method: 'GET',
      signal,
    });

    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    return null;
  }
}
