import { NextRequest } from 'next/server';
import { servePrivateFile } from '@/lib/private-files';

/** An attached bill, for its owner or an administrator. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return servePrivateFile(id, ['BILL']);
}
