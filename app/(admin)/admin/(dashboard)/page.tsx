import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const pendingApps = await prisma.accountApplication.count({ where: { status: 'PENDING' } });
  const pendingRequests = await prisma.onlineAccessRequest.count({ where: { status: 'PENDING' } });
  const pendingTx = await prisma.transaction.count({ where: { status: 'PENDING' } });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Pending Account Apps</h3>
          <p className="text-4xl font-bold mt-2">{pendingApps}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Pending Access Requests</h3>
          <p className="text-4xl font-bold mt-2">{pendingRequests}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Pending Transactions</h3>
          <p className="text-4xl font-bold mt-2">{pendingTx}</p>
        </div>
      </div>
    </div>
  );
}
