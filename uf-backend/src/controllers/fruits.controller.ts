import { Request, Response } from "express";
import { fetchData } from "../services/fetchData";
import { FruitsRepository } from "../repositories/fruits.repository";
import type { Fruit, ApiResponse } from "../types/types";

const repo = new FruitsRepository();

// GET /api/fruits — llama API externa, fallback al JSON local
export async function getAllFruits(_req: Request, res: Response) {
    const result = await fetchData<Fruit[]>("https://fruityvice.com/api/fruit/all");

    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        res.json({ data: result.data, status: 200, error: null, source: "api" });
        return;
    }

    res.json({ data: repo.readAll(), status: 200, error: null, source: "fallback" });
}

// GET /api/fruits/:id — llama API externa, fallback al JSON local
export async function getFruitById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "api" });
        return;
    }

    const result = await fetchData<Fruit>(`https://fruityvice.com/api/fruit/${id}`);

    if (result.data) {
        res.json({ ...result, source: "api" });
        return;
    }

    const local = repo.readOne(id);
    if (local) {
        res.json({ data: local, status: 200, error: null, source: "fallback" });
        return;
    }

    res.status(404).json({ data: null, status: 404, error: `Fruta con ID ${id} no encontrada`, source: "api" });
}

// POST /api/fruits — guarda en JSON local
export function createFruit(req: Request, res: Response) {
    const body = req.body as Omit<Fruit, "id">;

    if (!body.name || !body.family || !body.nutritions) {
        res.status(400).json({ data: null, status: 400, error: "Faltan campos requeridos: name, family, nutritions", source: "local" });
        return;
    }

    const created = repo.create(body);
    res.status(201).json({ data: created, status: 201, error: null, source: "local" });
}

// PUT /api/fruits/:id — actualiza en JSON local
export function updateFruit(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const updated = repo.update(id, req.body as Partial<Omit<Fruit, "id">>);
    if (!updated) {
        res.status(404).json({ data: null, status: 404, error: `Fruta con ID ${id} no encontrada`, source: "local" });
        return;
    }

    res.json({ data: updated, status: 200, error: null, source: "local" });
}

// DELETE /api/fruits/:id — elimina del JSON local
export function deleteFruit(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const deleted = repo.delete(id);
    if (!deleted) {
        res.status(404).json({ data: null, status: 404, error: `Fruta con ID ${id} no encontrada`, source: "local" });
        return;
    }

    res.json({ data: null, status: 200, error: null, source: "local" });
}