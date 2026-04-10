import { Request, Response } from "express";
import { fetchData } from "../services/fetchData";
import { UsersRepository } from "../repositories/users.repository";
import type { RandomUser, RandomUserApiResponse } from "../types/types";

const repo = new UsersRepository();

// GET /api/users — llama API externa, fallback al JSON local
export async function getAllUsers(_req: Request, res: Response) {
    const result = await fetchData<RandomUserApiResponse>("https://randomuser.me/api/?results=6");

    if (result.data?.results && result.data.results.length > 0) {
        res.json({ data: result.data, status: 200, error: null, source: "api" });
        return;
    }

    res.json({ data: { results: repo.readAll() }, status: 200, error: null, source: "fallback" });
}

// GET /api/users/:id — solo busca en JSON local (RandomUser API no soporta búsqueda por ID)
export function getUserById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const user = repo.readOne(id);
    if (!user) {
        res.status(404).json({ data: null, status: 404, error: `Usuario con ID ${id} no encontrado`, source: "local" });
        return;
    }

    res.json({ data: user, status: 200, error: null, source: "local" });
}

// POST /api/users
export function createUser(req: Request, res: Response) {
    const body = req.body as Omit<RandomUser, "id">;

    if (!body.name?.first || !body.email) {
        res.status(400).json({ data: null, status: 400, error: "Faltan campos requeridos: name.first, email", source: "local" });
        return;
    }

    const created = repo.create(body);
    res.status(201).json({ data: created, status: 201, error: null, source: "local" });
}

// PUT /api/users/:id
export function updateUser(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const updated = repo.update(id, req.body as Partial<Omit<RandomUser, "id">>);
    if (!updated) {
        res.status(404).json({ data: null, status: 404, error: `Usuario con ID ${id} no encontrado`, source: "local" });
        return;
    }

    res.json({ data: updated, status: 200, error: null, source: "local" });
}

// DELETE /api/users/:id
export function deleteUser(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ data: null, status: 400, error: "ID inválido", source: "local" });
        return;
    }

    const deleted = repo.delete(id);
    if (!deleted) {
        res.status(404).json({ data: null, status: 404, error: `Usuario con ID ${id} no encontrado`, source: "local" });
        return;
    }

    res.json({ data: null, status: 200, error: null, source: "local" });
}