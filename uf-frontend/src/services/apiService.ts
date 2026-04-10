// ============================================================
// SERVICIOS DEL FRONTEND
//
// La diferencia clave con el backend:
// Aquí fetchData llama a NUESTRO backend (via ngrok),
// no directamente a las APIs externas.
//
// Flujo completo:
//   Browser → fetchData('/api/anime')
//           → NEXT_PUBLIC_API_URL + '/api/anime'
//           → ngrok tunnel
//           → localhost:4000
//           → Express → AnimeChan (o fallback)
// ============================================================

import type { ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const defaultHeaders: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { headers: defaultHeaders });
    if (!response.ok) {
      return {
        data: null,
        status: response.status,
        error: `Error ${response.status}: ${response.statusText}`,
        source: "api",
      };
    }
    const data = (await response.json()) as ApiResponse<T>;
    return data;
  } catch (err) {
    return {
      data: null,
      status: 0,
      error: err instanceof Error ? err.message : "No se pudo conectar con el servidor",
      source: "api",
    };
  }
}

export class ApiService<T extends { id: number }> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(): Promise<ApiResponse<T[]>> {
    return fetchData<T[]>(this.endpoint);
  }

  async getOne(id: number): Promise<ApiResponse<T>> {
    return fetchData<T>(`${this.endpoint}/${id}`);
  }

  async create(body: Omit<T, "id">): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${this.endpoint}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(body),
      });
      return (await response.json()) as ApiResponse<T>;
    } catch (err) {
      return { data: null, status: 0, error: err instanceof Error ? err.message : "Error de red", source: "api" };
    }
  }

  async update(id: number, body: Partial<Omit<T, "id">>): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${this.endpoint}/${id}`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: defaultHeaders,
        body: JSON.stringify(body),
      });
      return (await response.json()) as ApiResponse<T>;
    } catch (err) {
      return { data: null, status: 0, error: err instanceof Error ? err.message : "Error de red", source: "api" };
    }
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    const url = `${BASE_URL}${this.endpoint}/${id}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: defaultHeaders,
      });
      return (await response.json()) as ApiResponse<null>;
    } catch (err) {
      return { data: null, status: 0, error: err instanceof Error ? err.message : "Error de red", source: "api" };
    }
  }
}