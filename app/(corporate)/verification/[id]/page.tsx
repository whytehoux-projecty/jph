import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VerificationForm } from './VerificationForm';

export default async function VerificationPage({ params }: { params: { id: string } }) {
    const app = await prisma.accountApplication.findUnique({
        where: { id: params.id }
    });

    if (!app || app.status !== 'VERIFICATION_REQUIRED') {
        notFound();
    }

    return (
        <main className="min-h-screen bg-off-white py-20 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-playfair font-bold text-charcoal mb-4">Identity Verification</h1>
                    <p className="text-charcoal-light">Please schedule a brief call with our team.</p>
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
