import { NextResponse } from 'next/server';
import { fetchData } from '@/services/fetchData';
import { JsonRepository } from '@/repositories/JsonRepository';
import type { ApodEntry } from '@/types/apod';

const repo = new JsonRepository<ApodEntry>('apod.json');
const NASA_KEY = process.env.NASA_API_KEY ?? 'DEMO_KEY';

// GET /api/apod/range — últimas 10 fotos
export async function GET() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 9);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&start_date=${fmt(start)}&end_date=${fmt(end)}`;

  const result = await fetchData<ApodEntry[]>(url);

  if (Array.isArray(result.data) && result.data.length > 0) {
    const withIds = (result.data as ApodEntry[]).map((e, i) => ({ ...e, id: i + 1 }));
    return NextResponse.json({ data: withIds, status: 200, error: null, source: 'api' });
  }

  return NextResponse.json({ data: repo.readAll(), status: 200, error: null, source: 'fallback' });
}
