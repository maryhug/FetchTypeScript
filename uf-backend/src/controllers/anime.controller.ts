import { Request, Response } from "express";
import { fetchData } from "../services/fetchData";
import { AnimeRepository } from "../repositories/anime.repository";
import type { AnimeQuote, ApiResponse } from "../types/types";

const repo = new AnimeRepository();

// GET /api/anime — cita aleatoria de API externa, fallback al JSON local
export async function getRandomAnime(_req: Request, res: Response) {
    const result = await fetchData<{ data: AnimeQuote }>("https://animechan.io/api/v1/quotes/random");

    if (result.data?.data) {
        const q = result.data.data;
        const response: ApiResponse<AnimeQuote> = {
            data: {
                id:        (q as unknown as Record<string, number>).id ?? 0,
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

    const all = repo.readAll();
    const random = all[Math.floor(Math.random() * all.length)];
    res.json({ data: random, status: 200, error: null, source: "fallback" });
}

// GET /api/anime/:id — busca en JSON local
export function getAnimeById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const quote = repo.readOne(id);
    if (!quote) {
        res.status(404).json({ data: null, status: 404, error: `Cita con ID ${id} no encontrada`, source: "local" });
        return;
    }

    res.json({ data: quote, status: 200, error: null, source: "local" });
}

// POST /api/anime
export function createAnimeQuote(req: Request, res: Response) {
    const body = req.body as Omit<AnimeQuote, "id">;

    if (!body.anime || !body.character || !body.quote) {
        res.status(400).json({ data: null, status: 400, error: "Faltan campos requeridos: anime, character, quote", source: "local" });
        return;
    }

    const created = repo.create(body);
    res.status(201).json({ data: created, status: 201, error: null, source: "local" });
}

// PUT /api/anime/:id
export function updateAnimeQuote(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const updated = repo.update(id, req.body as Partial<Omit<AnimeQuote, "id">>);
    if (!updated) {
        res.status(404).json({ data: null, status: 404, error: `Cita con ID ${id} no encontrada`, source: "local" });
        return;
    }

    res.json({ data: updated, status: 200, error: null, source: "local" });
}

// DELETE /api/anime/:id
export function deleteAnimeQuote(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const deleted = repo.delete(id);
    if (!deleted) {
        res.status(404).json({ data: null, status: 404, error: `Cita con ID ${id} no encontrada`, source: "local" });
        return;
    }

    res.json({ data: null, status: 200, error: null, source: "local" });
}