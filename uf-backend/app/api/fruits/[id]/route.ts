import { NextRequest, NextResponse } from 'next/server';
import { fetchData } from '@/services/fetchData';
import { FruitsRepository } from '@/repositories/fruits.repository';
import type { Fruit } from '@/types/types';

const repo = new FruitsRepository();

// GET /api/fruits/:id — llama API externa, fallback al JSON local
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { data: null, status: 400, error: 'ID inválido', source: 'api' },
      { status: 400 },
    );
  }

  const result = await fetchData<Fruit>(`https://fruityvice.com/api/fruit/${id}`);

  if (result.data) {
    return NextResponse.json({ ...result, source: 'api' });
  }

  const local = repo.readOne(id);
  if (local) {
    return NextResponse.json({ data: local, status: 200, error: null, source: 'fallback' });
  }

  return NextResponse.json(
    { data: null, status: 404, error: `Fruta con ID ${id} no encontrada`, source: 'api' },
    { status: 404 },
  );
}

// PUT /api/fruits/:id — actualiza en JSON local
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { data: null, status: 400, error: 'ID inválido', source: 'local' },
      { status: 400 },
    );
  }

  const body = (await request.json()) as Partial<Omit<Fruit, 'id'>>;
  const updated = repo.update(id, body);
  if (!updated) {
    return NextResponse.json(
      { data: null, status: 404, error: `Fruta con ID ${id} no encontrada`, source: 'local' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: updated, status: 200, error: null, source: 'local' });
}

// DELETE /api/fruits/:id — elimina del JSON local
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { data: null, status: 400, error: 'ID inválido', source: 'local' },
      { status: 400 },
    );
  }

  const deleted = repo.delete(id);
  if (!deleted) {
    return NextResponse.json(
      { data: null, status: 404, error: `Fruta con ID ${id} no encontrada`, source: 'local' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: null, status: 200, error: null, source: 'local' });
}
