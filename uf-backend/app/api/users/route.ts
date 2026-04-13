import { NextRequest, NextResponse } from 'next/server';
import { fetchData } from '@/services/fetchData';
import { UsersRepository } from '@/repositories/users.repository';
import type { RandomUser, RandomUserApiResponse } from '@/types/types';

const repo = new UsersRepository();

// GET /api/users — llama RandomUser API, fallback al JSON local
export async function GET() {
  const result = await fetchData<RandomUserApiResponse>(
    'https://randomuser.me/api/?results=6',
  );

  if (result.data?.results && result.data.results.length > 0) {
    return NextResponse.json({
      data: result.data,
      status: 200,
      error: null,
      source: 'api',
    });
  }

  return NextResponse.json({
    data: { results: repo.readAll() },
    status: 200,
    error: null,
    source: 'fallback',
  });
}

// POST /api/users — guarda en JSON local
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Omit<RandomUser, 'id'>;

  if (!body.name?.first || !body.email) {
    return NextResponse.json(
      {
        data: null,
        status: 400,
        error: 'Faltan campos requeridos: name.first, email',
        source: 'local',
      },
      { status: 400 },
    );
  }

  const created = repo.create(body);
  return NextResponse.json(
    { data: created, status: 201, error: null, source: 'local' },
    { status: 201 },
  );
}
