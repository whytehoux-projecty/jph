import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Serves a cheque photo to its owner, or to an administrator reviewing the
 * deposit. Anyone else gets 404 so ids can't be probed.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) return new NextResponse(null, { status: 401 });

  const image = await prisma.depositImage.findUnique({ where: { id } });
  const isAdmin = (session.user as any).role === 'ADMIN';
  if (!image || (!isAdmin && image.userId !== viewerId)) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(Buffer.from(image.data), {
    headers: {
      'Content-Type': image.contentType,
      'Content-Length': String(image.size),
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
