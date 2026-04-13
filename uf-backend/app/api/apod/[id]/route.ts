import { NextRequest, NextResponse } from 'next/server';
import { JsonRepository } from '@/repositories/JsonRepository';
import type { ApodEntry } from '@/types/apod';

const repo = new JsonRepository<ApodEntry>('apod.json');

// GET /api/apod/:id
export function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const item = repo.readAll().find((e) => e.id === id) ?? null;

  if (!item) {
    return NextResponse.json(
      { data: null, status: 404, error: 'No encontrado', source: 'local' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: item, status: 200, error: null, source: 'local' });
}

// PUT /api/apod/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const all = repo.readAll();
  const idx = all.findIndex((e) => e.id === id);

  if (idx === -1) {
    return NextResponse.json(
      { data: null, status: 404, error: 'No encontrado', source: 'local' },
      { status: 404 },
    );
  }

  const body = (await request.json()) as Partial<ApodEntry>;
  all[idx] = { ...all[idx], ...body };
  repo.write(all);
  return NextResponse.json({ data: all[idx], status: 200, error: null, source: 'local' });
}

// DELETE /api/apod/:id
export function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const all = repo.readAll();
  const filtered = all.filter((e) => e.id !== id);

  if (filtered.length === all.length) {
    return NextResponse.json(
      { data: null, status: 404, error: 'No encontrado', source: 'local' },
      { status: 404 },
    );
  }

  repo.write(filtered);
  return NextResponse.json({ data: null, status: 200, error: null, source: 'local' });
}
