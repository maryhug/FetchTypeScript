// ============================================================
// PARTE 3: ApiService<T> — Clase genérica de acceso a datos
//
// Encapsula (agrupa) la lógica de consumir un recurso REST.
// Al instanciarla, le dices el endpoint base:
//   const fruitService = new ApiService<Fruit>('https://fruityvice.com/api/fruit')
//
// Luego usas:
//   fruitService.getAll()    → GET https://fruityvice.com/api/fruit/all
//   fruitService.getOne(1)   → GET https://fruityvice.com/api/fruit/1
// ============================================================

import { fetchData } from "./fetchData";
import type { ApiResponse } from "./types";

export class ApiService<T> {
  // El endpoint base se guarda como atributo privado
  // 'private' = solo esta clase puede accederlo
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Trae todos los recursos del endpoint
  async getAll(): Promise<ApiResponse<T[]>> {
    return fetchData<T[]>(this.baseUrl);
  }

  // Trae un recurso por ID concatenándolo a la URL
  // Ejemplo: baseUrl='/api/fruit' + id=3 → '/api/fruit/3'
  async getOne(id: number): Promise<ApiResponse<T>> {
    return fetchData<T>(`${this.baseUrl}/${id}`);
  }
}
