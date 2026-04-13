import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Backend corriendo en Next.js (:3000)',
  });
}
