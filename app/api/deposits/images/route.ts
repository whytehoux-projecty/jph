import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CHEQUE_IMAGE_MAX_BYTES } from '@/lib/deposit-rules';

/** Photos not attached to a deposit within this time are deleted. */
const UNUSED_TTL_MS = 24 * 60 * 60 * 1000;
/** Unattached photos a customer may hold at once. */
const MAX_UNUSED = 10;

/** Recognises the image by its first bytes, not by the name or the browser's claim. */
function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'image/webp';
  return null;
}

/**
 * Stores one cheque photo for the signed-in customer and returns its id,
 * which submitDeposit attaches to the deposit. Photos are private: they're
 * only served by ./[id] to their owner or an administrator.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || (session.user as any).role !== 'USER') {
    return NextResponse.json({ error: 'Sign in to add cheque photos.' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'The photo could not be read. Try again.' }, { status: 400 });
  }
  const file = form.get('file');
  const side = form.get('side');
  if (!(file instanceof File) || (side !== 'FRONT' && side !== 'BACK')) {
    return NextResponse.json({ error: 'Choose a photo of the cheque.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > CHEQUE_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: 'The photo must be smaller than 4 MB.' }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffImageType(bytes);
  if (!contentType) {
    return NextResponse.json({ error: 'Use a JPEG, PNG or WebP photo.' }, { status: 415 });
  }

  await prisma.depositImage.deleteMany({
    where: { userId, transactionId: null, createdAt: { lt: new Date(Date.now() - UNUSED_TTL_MS) } },
  });
  const unused = await prisma.depositImage.count({ where: { userId, transactionId: null } });
  if (unused >= MAX_UNUSED) {
    return NextResponse.json({ error: 'Too many photos waiting. Submit or restart your cheque deposit.' }, { status: 429 });
  }

  const image = await prisma.depositImage.create({
    data: { userId, side, contentType, size: bytes.byteLength, data: Buffer.from(bytes) },
    select: { id: true },
  });

  return NextResponse.json({ id: image.id }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
