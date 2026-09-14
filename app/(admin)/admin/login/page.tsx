'use client'

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      is_admin: 'true'
    });

    if (result?.error) {
      setError('Invalid admin credentials');
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-gray-700 rounded text-white" required />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 bg-gray-700 rounded text-white" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded font-bold">Log In</button>
      </form>
    </div>
  );
}
