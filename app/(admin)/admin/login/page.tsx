'use client'

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        is_admin: 'true'
      });

      if (result?.error) {
        setError('Invalid admin credentials. Access denied.');
      } else {
        router.refresh();
        router.push('/admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-ink-900 text-paper-50 overflow-hidden font-sans">
      
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pine-700/30 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-vermilion-700/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Branding */}
        <div className="flex flex-col items-center mb-10 animate-fade-in-up">
          <div className="flex items-center justify-center w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl mb-6 shadow-2xl">
            <ShieldAlert className="w-7 h-7 text-vermilion-400" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white mb-2 text-center">
            Restricted Area
          </h1>
          <p className="text-paper-300 text-center text-sm">
            Heritage Trust Bank Administrative Portal
          </p>
        </div>

        {/* Login Card */}
        <form 
          onSubmit={handleLogin} 
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in-up shadow-black/50"
          style={{ animationDelay: '100ms' }}
        >
          
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 text-sm text-red-200 bg-red-950/50 border border-red-900/50 rounded-xl">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-paper-300 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-vermilion-600 focus:border-transparent transition-all sm:text-sm" 
                  placeholder="admin@jpheritage.com"
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-paper-300 uppercase tracking-wider">
                Security Key / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-vermilion-600 focus:border-transparent transition-all sm:text-sm" 
                  placeholder="••••••••••••"
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 mt-8 bg-vermilion-600 hover:bg-vermilion-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 focus:ring-vermilion-600 shadow-[0_0_20px_rgba(216,67,43,0.3)] hover:shadow-[0_0_25px_rgba(216,67,43,0.5)]"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Authenticate
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Link href="/" className="text-sm text-paper-300 hover:text-white transition-colors">
            &larr; Return to public site
          </Link>
        </div>

      </div>
    </div>
  );
}
