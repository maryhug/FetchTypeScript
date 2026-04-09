// ============================================================
// SERVIDOR EXPRESS — Punto de entrada del backend
//
// Express es un framework para crear servidores HTTP en Node.js.
// Aquí definimos todas las rutas que el frontend va a consumir.
//
// Puerto: 4000 (el que ngrok está tuneando)
// ============================================================

import express from "express";
import cors from "cors";
import { fetchData } from "./fetchData";
import { ApiService } from "./apiService";
import { getRandomAnimeQuote, usersFallback, fruitsFallback } from "./fallback";
import type { AnimeQuote, RandomUserApiResponse, Fruit, ApiResponse } from "./types";

const app = express();
const PORT = 4000;

// ============================================================
// MIDDLEWARE
// Un middleware es una función que se ejecuta en CADA petición
// antes de llegar al handler de la ruta.
// ============================================================

// cors() permite que el frontend (en otro origen/puerto)
// pueda hacer peticiones a este servidor sin error de CORS.
app.use(cors());

// express.json() permite leer el body de peticiones POST/PUT
// como un objeto JavaScript (por ahora no lo usamos, pero es buena práctica)
app.use(express.json());

// ============================================================
// PARTE 3 — Instancias de ApiService<T>
// Cada servicio apunta al endpoint externo correspondiente
// ============================================================
const animeService  = new ApiService<AnimeQuote>("https://animechan.io/api/v1/quotes");
const usersService  = new ApiService<RandomUserApiResponse>("https://randomuser.me/api");
const fruitsService = new ApiService<Fruit>("https://fruityvice.com/api/fruit");

// ============================================================
// RUTA DE SALUD — GET /health
// Sirve para verificar que el servidor está corriendo.
// El frontend puede llamarla para mostrar el estado de conexión.
// ============================================================
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend corriendo en puerto 4000" });
});

// ============================================================
// RUTA — GET /api/anime
// Devuelve una cita aleatoria de anime.
// ============================================================
app.get("/api/anime", async (_req, res) => {
  // Intentamos con la API real primero
  const result = await fetchData<{ data: AnimeQuote }>(
    "https://animechan.io/api/v1/quotes/random"
  );

  if (result.data?.data) {
    // La API respondió bien: normalizamos el formato
    const q = result.data.data;
    const response: ApiResponse<AnimeQuote> = {
      data: {
        anime:     q.anime     ?? "Desconocido",
        character: q.character ?? "Desconocido",
        quote:     (q as unknown as Record<string, string>).content ?? q.quote ?? "Sin cita",
      },
      status: 200,
      error: null,
      source: "api",
    };
    res.json(response);
    return;
  }

  // Si la API falla, usamos el fallback
  const response: ApiResponse<AnimeQuote> = {
    data: getRandomAnimeQuote(),
    status: 200,
    error: null,
    source: "fallback",
  };
  res.json(response);
});

// ============================================================
// RUTA — GET /api/users
// Devuelve 6 usuarios aleatorios.
// ============================================================
app.get("/api/users", async (_req, res) => {
  const result = await fetchData<RandomUserApiResponse>(
    "https://randomuser.me/api/?results=6"
  );

  if (result.data?.results && result.data.results.length > 0) {
    const response: ApiResponse<RandomUserApiResponse> = {
      data: result.data,
      status: 200,
      error: null,
      source: "api",
    };
    res.json(response);
    return;
  }

  // Fallback: devolvemos los usuarios de respaldo
  const response: ApiResponse<RandomUserApiResponse> = {
    data: { results: usersFallback },
    status: 200,
    error: null,
    source: "fallback",
  };
  res.json(response);
});

// ============================================================
// RUTA — GET /api/fruits
// Devuelve todas las frutas disponibles.
// ============================================================
app.get("/api/fruits", async (_req, res) => {
  const result = await fruitsService.getAll();

  // getAll llama a /api/fruit que no existe — usamos /api/fruit/all
  const result2 = await fetchData<Fruit[]>("https://fruityvice.com/api/fruit/all");

  if (result2.data && Array.isArray(result2.data) && result2.data.length > 0) {
    const response: ApiResponse<Fruit[]> = {
      data: result2.data,
      status: 200,
      error: null,
      source: "api",
    };
    res.json(response);
    return;
  }

  // Fallback
  const response: ApiResponse<Fruit[]> = {
    data: fruitsFallback,
    status: 200,
    error: null,
    source: "fallback",
  };
  res.json(response);
});

// ============================================================
// RUTA — GET /api/fruits/:id
// Devuelve una sola fruta por ID.
// :id es un parámetro dinámico en la URL (req.params.id)
// Ejemplo: GET /api/fruits/3
// ============================================================
app.get("/api/fruits/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Validamos que el ID sea un número válido
  if (isNaN(id)) {
    res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "api" });
    return;
  }

  const result = await fruitsService.getOne(id);

  if (result.data) {
    res.json({ ...result, source: "api" });
    return;
  }

  // Buscamos en el fallback
  const fruit = fruitsFallback.find((f) => f.id === id);
  if (fruit) {
    res.json({ data: fruit, status: 200, error: null, source: "fallback" });
    return;
  }

  res.status(404).json({ data: null, status: 404, error: `Fruta con ID ${id} no encontrada`, source: "api" });
});

// ============================================================
// ARRANCAR EL SERVIDOR
// app.listen(puerto, callback) pone a escuchar el servidor
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📡 Rutas disponibles:`);
  console.log(`   GET /health`);
  console.log(`   GET /api/anime`);
  console.log(`   GET /api/users`);
  console.log(`   GET /api/fruits`);
  console.log(`   GET /api/fruits/:id`);
  console.log(`\n⚡ Expuesto con ngrok en:`);
  console.log(`   https://florine-constructional-maegan.ngrok-free.dev\n`);
});
