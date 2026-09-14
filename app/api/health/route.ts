import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'online',
      timestamp: new Date().toISOString(),
      message: 'All systems operational',
    },
  });
}
