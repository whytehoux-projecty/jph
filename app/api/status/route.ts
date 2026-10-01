import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptDeterministic } from '@/lib/encryption';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get('ref');
    const email = searchParams.get('email');

    if (!ref || !email) {
        return NextResponse.json({ error: 'Reference ID and email are required' }, { status: 400 });
    }

    try {
        const encryptedEmail = encryptDeterministic(email);

        if (ref.startsWith('HT-APP-')) {
            const application = await prisma.accountApplication.findFirst({
                where: { 
                    referenceId: ref,
                    email: encryptedEmail 
                }
            });

            if (application) {
                return NextResponse.json({
                    status: application.status.toLowerCase(),
                    type: 'application',
                    createdAt: application.createdAt
                });
            }
        } else if (ref.startsWith('HT-ENR-')) {
            const request = await prisma.onlineAccessRequest.findFirst({
                where: { 
                    referenceId: ref,
                    email: encryptedEmail 
                }
            });

            if (request) {
                return NextResponse.json({
                    status: request.status.toLowerCase(),
                    type: 'enrollment',
                    createdAt: request.createdAt
                });
            }
        }

        return NextResponse.json({ status: 'not_found' });
    } catch (error) {
        console.error('Status lookup error:', error);
        return NextResponse.json({ error: 'Failed to look up status' }, { status: 500 });
    }
}
