// ============================================================
// PARTE 2: fetchData<T> — Función genérica de fetching
//
// En el backend usamos 'node-fetch' porque Node.js (antes de
// la versión 18) no tiene fetch nativo. Con ts-node-dev en v18+
// también podría usarse el fetch global, pero node-fetch
// garantiza compatibilidad.
// ============================================================

import fetch from "node-fetch";
import type { ApiResponse } from "../types/types";

export async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    // response.ok = true si el status está entre 200 y 299
    // Un 404 o 500 tienen ok = false
    if (!response.ok) {
      return {
        data: null,
        status: response.status,
        error: `Error HTTP ${response.status}: ${response.statusText}`,
        source: "api",
      };
    }

    const data = (await response.json()) as T;
    return { data, status: 200, error: null, source: "api" };

  } catch (err) {
    // Este catch atrapa errores de RED (sin internet, DNS, timeout)
    // Son distintos a errores HTTP: aquí el servidor nunca respondió
    return {
      data: null,
      status: 0,
      error: err instanceof Error ? err.message : "Error de red desconocido",
      source: "api",
    };
  }
}
