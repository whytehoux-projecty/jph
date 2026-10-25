import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PRIVATE_FILE_MAX_BYTES } from '@/lib/file-limits';

/**
 * Private customer files (cheque photos, attached bills), stored in the
 * deposit_images table rather than on disk or in public/, so they are only
 * ever served by these helpers to their owner or an administrator.
 *
 * `side` says what a file is: FRONT / BACK of a cheque, or BILL.
 */
export type PrivateFileSide = 'FRONT' | 'BACK' | 'BILL';

/** Files not attached to a deposit or payment within this time are deleted. */
const UNUSED_TTL_MS = 24 * 60 * 60 * 1000;
/** Unattached files a customer may hold at once. */
const MAX_UNUSED = 10;

/** Recognises the file by its first bytes, not by the name or the browser's claim. */
function sniffType(bytes: Uint8Array, allowPdf: boolean): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'image/webp';
  if (allowPdf && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) {
    return 'application/pdf';
  }
  return null;
}

/**
 * Handles an upload (multipart: `file`, `side`) for the signed-in customer
 * and returns `{ id }`, which the deposit or payment action then attaches.
 */
export async function storePrivateFile(
  request: NextRequest,
  { sides, allowPdf, label }: { sides: PrivateFileSide[]; allowPdf: boolean; label: string },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || (session.user as any).role !== 'USER') {
    return NextResponse.json({ error: `Sign in to add ${label}.` }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'The file could not be read. Try again.' }, { status: 400 });
  }
  const file = form.get('file');
  const side = form.get('side') as PrivateFileSide | null;
  if (!(file instanceof File) || !side || !sides.includes(side)) {
    return NextResponse.json({ error: `Choose ${label}.` }, { status: 400 });
  }
  if (file.size === 0 || file.size > PRIVATE_FILE_MAX_BYTES) {
    return NextResponse.json({ error: 'The file must be smaller than 4 MB.' }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffType(bytes, allowPdf);
  if (!contentType) {
    return NextResponse.json(
      { error: allowPdf ? 'Use a PDF, JPEG, PNG or WebP file.' : 'Use a JPEG, PNG or WebP photo.' },
      { status: 415 },
    );
  }

  await prisma.depositImage.deleteMany({
    where: { userId, transactionId: null, createdAt: { lt: new Date(Date.now() - UNUSED_TTL_MS) } },
  });
  const unused = await prisma.depositImage.count({ where: { userId, transactionId: null } });
  if (unused >= MAX_UNUSED) {
    return NextResponse.json({ error: 'Too many files waiting. Finish or restart what you were doing.' }, { status: 429 });
  }

  const stored = await prisma.depositImage.create({
    data: { userId, side, contentType, size: bytes.byteLength, data: Buffer.from(bytes) },
    select: { id: true },
  });

  return NextResponse.json({ id: stored.id }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Serves a stored file to its owner, or to an administrator. Anyone else,
 * or a file of another kind, gets 404 so ids can't be probed.
 */
export async function servePrivateFile(id: string, sides: PrivateFileSide[]) {
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) return new NextResponse(null, { status: 401 });

  const file = await prisma.depositImage.findUnique({ where: { id } });
  const isAdmin = (session.user as any).role === 'ADMIN';
  if (!file || !sides.includes(file.side as PrivateFileSide) || (!isAdmin && file.userId !== viewerId)) {
    return new NextResponse(null, { status: 404 });
  }

  const isPdf = file.contentType === 'application/pdf';
  return new NextResponse(Buffer.from(file.data), {
    headers: {
      'Content-Type': file.contentType,
      'Content-Length': String(file.size),
      // PDFs download rather than render inside our origin.
      'Content-Disposition': isPdf ? `attachment; filename="bill-${file.id}.pdf"` : 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
