import { NextResponse } from 'next/server';

// Dev-only endpoint has been disabled in production build.
export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
