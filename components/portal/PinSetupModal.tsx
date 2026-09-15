'use client';

import { useState } from 'react';
import { setupTransactionPin } from '@/app/actions/profile';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export function PinSetupModal() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be between 4 and 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await setupTransactionPin(pin);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-vintage-gold/10 rounded-full flex items-center justify-center text-vintage-gold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-playfair font-bold text-charcoal">Action Required</CardTitle>
          <CardDescription>
            To secure your transactions, you must set up a Transaction PIN before using the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="py-6 flex flex-col items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-12 h-12" />
              <p className="font-medium text-lg">PIN Set Successfully!</p>
              <p className="text-sm text-emerald-600/80">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Transaction PIN (4-6 digits)
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirm Transaction PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4 h-12" disabled={loading}>
                {loading ? 'Saving...' : 'Save PIN'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
