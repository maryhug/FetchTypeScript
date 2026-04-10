// ============================================================
// TIPOS DEL BACKEND
// Definen la forma exacta de los datos que devuelve cada API
// externa y la forma de nuestra respuesta genérica.
// ============================================================

// --- Respuesta genérica que envuelve CUALQUIER dato ---
// T es el genérico: cuando lo uses, dile qué tipo va adentro
// Ejemplo:  ApiResponse<AnimeQuote>   →  data será AnimeQuote | null
export interface ApiResponse<T> {
  data: T | null;       // El dato pedido. null si hubo error
  status: number;       // Código HTTP: 200, 404, 500, etc.
  error: string | null; // Mensaje de error. null si todo OK
  source: "api" | "fallback" | "local"; // Indica si vino de la API real o del respaldo
}

export interface AnimeQuote {
  id: number;
  anime: string;
  character: string;
  quote: string;
}

export interface RandomUser {
  id: number;
  name: { title: string; first: string; last: string };
  email: string;
  location: { country: string; city: string };
  picture: { large: string; medium: string; thumbnail: string };
  phone: string;
  nat: string;
}

export interface RandomUserApiResponse {
  results: RandomUser[];
}

export interface Fruit {
  id: number;
  name: string;
  family: string;
  order: string;
  genus: string;
  nutritions: {
    calories: number;
    fat: number;
    sugar: number;
    carbohydrates: number;
    protein: number;
  };
}