'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/commercial-ui/Card';
import { Button } from '@/components/commercial-ui/Button';
import { Input } from '@/components/forms/Input';
import { CalendarClock, CheckCircle, Video } from 'lucide-react';
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
            <Card className="text-center p-12 shadow-vintage-lg border-none bg-white">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">Meeting Scheduled!</h2>
                <p className="text-charcoal-light mb-8">
                    Your verification call has been scheduled successfully via {method}. One of our agents will contact you at the chosen time.
                </p>
                <Button onClick={() => router.push('/')} variant="primary">
                    Return to Home
                </Button>
            </Card>
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
        <Card className="shadow-vintage-xl border-white/20">
            <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-charcoal">Schedule Verification Call</h2>
                        <p className="text-sm text-gray-500">For {app.firstName} - {app.applicationType} Account</p>
                    </div>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Select Date" 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                            required
                        />
                        <Input 
                            label="Select Time" 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-charcoal">Preferred Contact Method</label>
                        <select
                            className="w-full h-12 rounded-lg border border-faded-gray px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy"
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

                    <div className="pt-4">
                        <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                            <CalendarClock className="w-4 h-4 mr-2" /> Confirm Appointment
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
