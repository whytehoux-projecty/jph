'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { CalendarClock, CheckCircle, Video, ArrowRight } from 'lucide-react';
import { scheduleVerification } from './actions';

type AppInfo = {
    id: string;
    firstName: string;
    applicationType: string;
    status: string;
};

export function VerificationForm({ app }: { app: AppInfo }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [method, setMethod] = useState('Zoom');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    if (success) {
        return (
            <div className="bg-paper-50 p-10 rounded border border-paper-200 text-center shadow-sm animate-fade-in-up">
                <div className="w-16 h-16 bg-paper-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-pine-700" aria-hidden="true" />
                </div>
                <h2 className="font-display text-h3 text-ink-900 mb-4">Meeting Scheduled!</h2>
                <p className="text-body text-ink-700 mb-8">
                    Your verification call has been scheduled successfully via {method}. One of our agents will contact you at the chosen time.
                </p>
                <Button onClick={() => router.push('/')} variant="primary" className="w-full sm:w-auto">
                    Return to Homepage
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!date || !time || !method) {
            setError('Please fill in all fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            await scheduleVerification({
                id: app.id,
                meetingDate: date,
                meetingTime: time,
                meetingMethod: method
            });
            setSuccess(true);
        } catch (err) {
            setError('Failed to schedule. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-paper-50 rounded border border-paper-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-paper-200">
                <div className="w-12 h-12 bg-paper-100 rounded flex items-center justify-center">
                    <Video className="w-6 h-6 text-pine-700" aria-hidden="true" />
                </div>
                <div>
                    <h2 className="font-display text-h4 text-ink-900">Schedule Call</h2>
                    <p className="text-small text-ink-500">For {app.firstName} - {app.applicationType} Account</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-vermilion-600/10 text-vermilion-700 text-small rounded border border-vermilion-600/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-small font-medium text-ink-900">Select Date</label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full h-12 rounded border bg-paper-50 px-3 text-body border-paper-300 outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-small font-medium text-ink-900">Select Time</label>
                        <input 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="w-full h-12 rounded border bg-paper-50 px-3 text-body border-paper-300 outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-small font-medium text-ink-900">Preferred Contact Method</label>
                    <select
                        className="w-full h-12 rounded border bg-paper-50 px-3 text-body border-paper-300 outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        required
                    >
                        <option value="Zoom">Zoom Video</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="WhatsApp Video">WhatsApp Video</option>
                        <option value="Telegram Video">Telegram Video</option>
                        <option value="Direct Phone Call">Direct Phone Call</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                        <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
