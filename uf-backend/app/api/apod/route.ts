import { NextRequest, NextResponse } from 'next/server';
import { fetchData } from '@/services/fetchData';
import { JsonRepository } from '@/repositories/JsonRepository';
import type { ApodEntry } from '@/types/apod';

const repo = new JsonRepository<ApodEntry>('apod.json');
const NASA_KEY = process.env.NASA_API_KEY ?? 'DEMO_KEY';

// GET /api/apod — foto astronómica del día
export async function GET() {
  const result = await fetchData<ApodEntry>(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`,
  );

  if (result.data && !('code' in (result.data as object))) {
    return NextResponse.json({ data: result.data, status: 200, error: null, source: 'api' });
  }

  const local = repo.readAll();
  const rand = local[Math.floor(Math.random() * local.length)] ?? null;
  return NextResponse.json({ data: rand, status: 200, error: null, source: 'fallback' });
}

// POST /api/apod — crea entrada local
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Omit<ApodEntry, 'id'>;
  const all = repo.readAll();
  const newEntry: ApodEntry = { id: (all.at(-1)?.id ?? 0) + 1, ...body };
  repo.write([...all, newEntry]);
  return NextResponse.json(
    { data: newEntry, status: 201, error: null, source: 'local' },
    { status: 201 },
  );
}
