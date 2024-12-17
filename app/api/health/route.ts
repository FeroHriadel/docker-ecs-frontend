import { NextResponse } from 'next/server';

// health check route for AWS ALB
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
