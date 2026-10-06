'use client';

import { useState } from 'react';
import { updateSystemSettings } from '@/app/actions/systemSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';

interface Props {
    initialSettings: {
        minimumInitialDeposit: number;
    } | null;
}

export default function GlobalSettingsClient({ initialSettings }: Props) {
    const [minDeposit, setMinDeposit] = useState(initialSettings?.minimumInitialDeposit?.toString() || '0');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const parsed = parseFloat(minDeposit);
            if (isNaN(parsed) || parsed < 0) {
                throw new Error('Please enter a valid positive number.');
            }
            await updateSystemSettings({ minimumInitialDeposit: parsed });
            setSuccessMessage('Settings saved successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Account Opening Configurations</h3>
                <p className="text-sm text-gray-500 mt-1">Configure limits and requirements for new account registrations.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="minDeposit">Minimum Initial Deposit (USD)</Label>
                    <div className="relative max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <Input
                            id="minDeposit"
                            type="number"
                            min="0"
                            step="0.01"
                            value={minDeposit}
                            onChange={(e) => setMinDeposit(e.target.value)}
                            className="pl-7"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        This limit will be enforced on the JPH-CIP-1040 execution form.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {error}
                </div>
            )}
            
            {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMessage}
                </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
