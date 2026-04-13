import { NextRequest, NextResponse } from 'next/server';
import { fetchData } from '@/services/fetchData';
import { FruitsRepository } from '@/repositories/fruits.repository';
import type { Fruit } from '@/types/types';

const repo = new FruitsRepository();

// GET /api/fruits — primero intenta API externa; locales modificados tienen prioridad
export async function GET() {
  const result = await fetchData<Fruit[]>('https://fruityvice.com/api/fruit/all');

  if (result.data && Array.isArray(result.data) && result.data.length > 0) {
    const localFruits = repo.readAll();
    const localIds = new Set(localFruits.map((f) => f.id));
    const apiOnly = (result.data as Fruit[]).filter((f) => !localIds.has(f.id));
    const merged = [...localFruits, ...apiOnly];
    return NextResponse.json({ data: merged, status: 200, error: null, source: 'api' });
  }

  return NextResponse.json({
    data: repo.readAll(),
    status: 200,
    error: null,
    source: 'fallback',
  });
}

// POST /api/fruits — guarda en JSON local
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Omit<Fruit, 'id'>;

  if (!body.name || !body.family || !body.nutritions) {
    return NextResponse.json(
      { data: null, status: 400, error: 'Faltan campos requeridos: name, family, nutritions', source: 'local' },
      { status: 400 },
    );
  }

  const created = repo.create(body);
  return NextResponse.json(
    { data: created, status: 201, error: null, source: 'local' },
    { status: 201 },
  );
}
