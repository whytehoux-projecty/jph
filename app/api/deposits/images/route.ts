import { NextRequest } from 'next/server';
import { storePrivateFile } from '@/lib/private-files';

/** Stores one cheque photo (side FRONT or BACK) for the signed-in customer. */
export async function POST(request: NextRequest) {
  return storePrivateFile(request, { sides: ['FRONT', 'BACK'], allowPdf: false, label: 'cheque photos' });
}
