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
            <main className="min-h-screen bg-[#07172B] py-20 px-4 flex items-center justify-center font-sans">
                <div className="max-w-md w-full bg-white p-10 shadow-2xl border border-neutral-300 text-center space-y-5">
                    <div className="w-16 h-16 bg-blue-50 text-heritage-navy rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-[#0D2545]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-playfair font-bold text-neutral-900">Application Already Executed</h1>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                        This official registration form has already been completed and submitted for verification. This single-use link is no longer active.
                    </p>
                    <a href="/login" className="inline-block mt-4 px-8 py-3 bg-[#0D2545] text-white text-sm font-semibold tracking-wide hover:bg-[#1B355B] transition-colors">
                        Proceed to Heritage Vault Login
                    </a>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#07172B] py-8 md:py-14 px-2 sm:px-4 md:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <RegistrationFormClient application={application} />
            </div>
        </main>
    );
}
