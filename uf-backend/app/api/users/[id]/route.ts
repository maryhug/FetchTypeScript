import { NextRequest, NextResponse } from 'next/server';
import { UsersRepository } from '@/repositories/users.repository';
import type { RandomUser } from '@/types/types';

const repo = new UsersRepository();

// GET /api/users/:id — solo busca en JSON local (RandomUser API no soporta búsqueda por ID)
export function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { data: null, status: 400, error: 'ID inválido', source: 'local' },
      { status: 400 },
    );
  }

  const user = repo.readOne(id);
  if (!user) {
    return NextResponse.json(
      { data: null, status: 404, error: `Usuario con ID ${id} no encontrado`, source: 'local' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: user, status: 200, error: null, source: 'local' });
}

// PUT /api/users/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { data: null, status: 400, error: 'ID inválido', source: 'local' },
      { status: 400 },
    );
  }

  const body = (await request.json()) as Partial<Omit<RandomUser, 'id'>>;
  const updated = repo.update(id, body);
  if (!updated) {
    return NextResponse.json(
      { data: null, status: 404, error: `Usuario con ID ${id} no encontrado`, source: 'local' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: updated, status: 200, error: null, source: 'local' });
}

// DELETE /api/users/:id
export function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
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
      { data: null, status: 404, error: `Usuario con ID ${id} no encontrado`, source: 'local' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: null, status: 200, error: null, source: 'local' });
}
