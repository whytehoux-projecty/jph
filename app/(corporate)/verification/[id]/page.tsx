import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VerificationForm } from './VerificationForm';
import { ShieldCheck } from 'lucide-react';
import { BRAND } from '@/src/content/facts';

export default async function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await prisma.accountApplication.findUnique({
        where: { id }
    });

    if (!app || app.status !== 'VERIFICATION_REQUIRED') {
        notFound();
    }

    return (
        <main className="min-h-screen bg-paper-100 py-24 px-6">
            <div className="container mx-auto max-w-xl">
                <div className="mb-12 text-center">
                    <ShieldCheck className="w-10 h-10 text-vermilion-600 mx-auto mb-4" aria-hidden="true" />
                    <h1 className="font-display text-display-sm text-ink-900 mb-3">Identity Verification</h1>
                    <p className="text-body-lg text-ink-700">Please schedule a brief call with the {BRAND.shortName} team.</p>
                </div>

                <VerificationForm
                    app={{
                        id: app.id,
                        firstName: app.firstName,
                        applicationType: app.applicationType,
                        status: app.status
                    }}
                />
            </div>
        </main>
    );
}
