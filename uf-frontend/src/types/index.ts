// ============================================================
// TIPOS DEL FRONTEND
// Son los mismos que en el backend — en un proyecto real
// podrías compartirlos con un paquete o monorepo.
// Aquí los repetimos para mantener los proyectos independientes.
// ============================================================

// Respuesta genérica que devuelve NUESTRO backend
export interface ApiResponse<T> {
  data: T | null;
  status: number;
  error: string | null;
  source: "api" | "fallback"; // Nos dice si vino de la API real o del respaldo
}

export interface AnimeQuote {
  anime: string;
  character: string;
  quote: string;
}

export interface RandomUser {
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
