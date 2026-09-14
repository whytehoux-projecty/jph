import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-charcoal text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold font-playfair">JPHeritage Admin</h1>
        <div className="flex gap-4">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/applications">Account Applications</Link>
          <Link href="/admin/requests">Internet Banking Requests</Link>
          <Link href="/admin/transactions">Transactions</Link>
          <form action="/api/auth/signout" method="POST">
             <button type="submit">Sign Out</button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
