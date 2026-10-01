'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/commercial-ui/Button';

export function CookieModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('heritage_cookie_consent');
        if (!stored) {
            // Slight delay before popping up
            const timer = setTimeout(() => setOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('heritage_cookie_consent', 'true');
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm bg-paper-50 p-6 rounded-t sm:rounded border border-paper-200 shadow-lg z-50 animate-slide-up-fade">
                    <div className="flex justify-between items-start mb-4">
                        <Dialog.Title className="font-display text-h4 text-ink-900">
                            Cookie Preferences
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-ink-500 hover:text-ink-900 transition-colors" aria-label="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>
                    <Dialog.Description className="text-small text-ink-700 mb-6">
                        We use cookies to enhance your banking experience, analyze site usage, and assist in our marketing efforts. By continuing to use our site, you agree to our use of cookies.
                    </Dialog.Description>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleAccept} variant="primary" className="flex-1 text-center justify-center">
                            Accept all
                        </Button>
                        <Button onClick={() => setOpen(false)} variant="secondary" className="flex-1 text-center justify-center">
                            Manage
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
