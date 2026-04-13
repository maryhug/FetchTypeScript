// Next.js (Node.js 18+) ya incluye fetch nativo — no se necesita node-fetch
import type { ApiResponse } from '../types/types';

export async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return {
        data: null,
        status: response.status,
        error: `Error HTTP ${response.status}: ${response.statusText}`,
        source: 'api',
      };
    }

    const data = (await response.json()) as T;
    return { data, status: 200, error: null, source: 'api' };
  } catch (err) {
    return {
      data: null,
      status: 0,
      error: err instanceof Error ? err.message : 'Error de red desconocido',
      source: 'api',
    };
  }
}
