import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RegistrationFormClient from './RegistrationFormClient';

export default async function RegistrationFormPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const application = await prisma.accountApplication.findUnique({
        where: { registrationToken: token }
    });

    if (!application || application.status !== 'APPROVED') {
        notFound();
    }

    if (application.registrationFormId) {
        return (
            <main className="min-h-screen bg-off-white py-20 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-neutral-200 text-center space-y-4">
                    <h1 className="text-2xl font-playfair font-bold text-charcoal">Registration Complete</h1>
                    <p className="text-charcoal-light">This registration link has already been used.</p>
                    <a href="/login" className="inline-block mt-4 px-6 py-2 bg-heritage-navy text-white rounded-md font-medium">Go to Login</a>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-100 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-3xl font-playfair font-bold text-charcoal">Official Registration Form</h1>
                    <p className="text-charcoal-light text-sm">Please complete all required fields accurately. This information is used for KYC verification.</p>
                </div>
                
                <RegistrationFormClient application={application} />
            </div>
        </main>
    );
}
