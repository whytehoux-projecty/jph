import { NextRequest } from 'next/server';
import { servePrivateFile } from '@/lib/private-files';

/** A cheque photo, for its owner or an administrator. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return servePrivateFile(id, ['FRONT', 'BACK']);
}
