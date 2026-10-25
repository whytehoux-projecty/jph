import { NextRequest } from 'next/server';
import { storePrivateFile } from '@/lib/private-files';

/** Stores a bill (PDF or photo) the customer attaches to a bill payment. */
export async function POST(request: NextRequest) {
  return storePrivateFile(request, { sides: ['BILL'], allowPdf: true, label: 'a copy of the bill' });
}
