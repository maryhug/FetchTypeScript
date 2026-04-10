export interface ApiResponse<T> {
  data: T | null;
  status: number;
  error: string | null;
  source: "api" | "fallback" | "local";
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

export interface ApodEntry {
  id:          number;
  date:        string;
  title:       string;
  explanation: string;
  url:         string;
  hdurl?:      string;
  media_type:  "image" | "video";
  copyright?:  string;
}
