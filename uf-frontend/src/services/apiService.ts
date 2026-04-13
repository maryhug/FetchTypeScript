// ============================================================
// Capa de Servicios — apiService.ts
//
// Responsabilidad: toda la comunicación HTTP con el backend.
// Los componentes no hacen fetch directamente; usan esta capa.
// ============================================================

import type { ApiResponse } from '../types/index.js';
import { API_URL } from '../config.js';

// Cabeceras comunes para todas las peticiones
const HEADERS: HeadersInit = {
  'ngrok-skip-browser-warning': 'true',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// ── Función genérica de GET ───────────────────────────────────────────────────
export async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, { headers: HEADERS });

    if (!response.ok) {
      return {
        data: null,
        status: response.status,
        error: `Error ${response.status}: ${response.statusText}`,
        source: 'api',
      };
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (err) {
    return {
      data: null,
      status: 0,
      error: err instanceof Error ? err.message : 'No se pudo conectar con el servidor',
      source: 'api',
    };
  }
}

// ── Clase genérica con CRUD completo ─────────────────────────────────────────
//
// Uso:
//   const fruitsService = new ApiService<Fruit>('/api/fruits');
//   const result = await fruitsService.getAll();
//
export class ApiService<T extends { id: number }> {
  constructor(private endpoint: string) {}

  getAll(): Promise<ApiResponse<T[]>> {
    return fetchData<T[]>(this.endpoint);
  }

  getOne(id: number): Promise<ApiResponse<T>> {
    return fetchData<T>(`${this.endpoint}/${id}`);
  }

  async create(body: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_URL}${this.endpoint}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      return (await res.json()) as ApiResponse<T>;
    } catch (err) {
      return { data: null, status: 0, error: err instanceof Error ? err.message : 'Error de red', source: 'api' };
    }
  }

  async update(id: number, body: Partial<Omit<T, 'id'>>): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_URL}${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      return (await res.json()) as ApiResponse<T>;
    } catch (err) {
      return { data: null, status: 0, error: err instanceof Error ? err.message : 'Error de red', source: 'api' };
    }
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      const res = await fetch(`${API_URL}${this.endpoint}/${id}`, {
        method: 'DELETE',
        headers: HEADERS,
      });
      return (await res.json()) as ApiResponse<null>;
    } catch (err) {
      return { data: null, status: 0, error: err instanceof Error ? err.message : 'Error de red', source: 'api' };
    }
  }
}
