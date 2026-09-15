'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

function ImpersonateLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    // Attempt to sign in with the impersonation token
    signIn('credentials', {
      impersonationToken: token,
      redirect: false
    }).then((res) => {
      if (res?.error) {
        alert('Invalid or expired impersonation session.');
        router.push('/admin/users');
      } else {
        // Success! Redirect to the user's dashboard
        router.push('/dashboard');
        router.refresh();
      }
    }).catch(() => {
      router.push('/login');
    });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-vintage-gold" />
      <p className="text-charcoal font-medium">Securing session...</p>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-vintage-gold" />
      </div>
    }>
      <ImpersonateLogic />
    </Suspense>
  );
}
