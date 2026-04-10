import { Request, Response } from "express";
import { fetchData } from "../services/fetchData";
import { JsonRepository } from "../repositories/JsonRepository";
import { ApodEntry } from "../types/apod";

const repo    = new JsonRepository<ApodEntry>("apod.json");
const NASA_KEY = process.env.NASA_API_KEY ?? "DEMO_KEY";

export async function getApodToday(_req: Request, res: Response) {
    const result = await fetchData<ApodEntry>(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`
    );
    if (result.data && !("code" in (result.data as object))) {
        res.json({ data: result.data, status: 200, error: null, source: "api" });
        return;
    }
    const local = repo.readAll();
    const rand  = local[Math.floor(Math.random() * local.length)] ?? null;
    res.json({ data: rand, status: 200, error: null, source: "fallback" });
}

export async function getApodRange(_req: Request, res: Response) {
    const end   = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 9);
    const fmt   = (d: Date) => d.toISOString().split("T")[0];
    const url   = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&start_date=${fmt(start)}&end_date=${fmt(end)}`;

    const result = await fetchData<ApodEntry[]>(url);
    if (Array.isArray(result.data) && result.data.length > 0) {
        const withIds = (result.data as ApodEntry[]).map((e, i) => ({ ...e, id: i + 1 }));
        res.json({ data: withIds, status: 200, error: null, source: "api" });
        return;
    }
    res.json({ data: repo.readAll(), status: 200, error: null, source: "fallback" });
}

export function getApodById(req: Request, res: Response) {
    const id   = parseInt(req.params["id"], 10);
    const item = repo.readAll().find(e => e.id === id) ?? null;
    if (!item) {
        res.status(404).json({ data: null, status: 404, error: "No encontrado", source: "local" });
        return;
    }
    res.json({ data: item, status: 200, error: null, source: "local" });
}

export function createApod(req: Request, res: Response) {
    const body    = req.body as Omit<ApodEntry, "id">;
    const all     = repo.readAll();
    const newEntry: ApodEntry = { id: (all.at(-1)?.id ?? 0) + 1, ...body };
    repo.write([...all, newEntry]);
    res.status(201).json({ data: newEntry, status: 201, error: null, source: "local" });
}

export function updateApod(req: Request, res: Response) {
    const id  = parseInt(req.params["id"], 10);
    const all = repo.readAll();
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) {
        res.status(404).json({ data: null, status: 404, error: "No encontrado", source: "local" });
        return;
    }
    all[idx] = { ...all[idx], ...(req.body as Partial<ApodEntry>) };
    repo.write(all);
    res.json({ data: all[idx], status: 200, error: null, source: "local" });
}

export function deleteApod(req: Request, res: Response) {
    const id       = parseInt(req.params["id"], 10);
    const all      = repo.readAll();
    const filtered = all.filter(e => e.id !== id);
    if (filtered.length === all.length) {
        res.status(404).json({ data: null, status: 404, error: "No encontrado", source: "local" });
        return;
    }
    repo.write(filtered);
    res.json({ data: null, status: 200, error: null, source: "local" });
}