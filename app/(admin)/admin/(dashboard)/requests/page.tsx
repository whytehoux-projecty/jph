import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function OnlineRequests() {
  const requests = await prisma.onlineAccessRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const handleApprove = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string;
    const request = await prisma.onlineAccessRequest.findUnique({ where: { id } });
    if (!request) return;
    
    // Update the user's hasOnlineAccess flag
    const user = await prisma.user.findUnique({ where: { email: request.email } });
    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: { hasOnlineAccess: true }
        });
    }

    // Update request
    await prisma.onlineAccessRequest.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() }
    });

    revalidatePath('/admin/requests');
  };

  const handleReject = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string;
    await prisma.onlineAccessRequest.update({
      where: { id },
      data: { status: 'REJECTED', reviewedAt: new Date() }
    });
    revalidatePath('/admin/requests');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Internet Banking Requests</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b-2 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-4">Account Number</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b dark:border-neutral-600">
                <td className="px-6 py-4">{req.accountNumber}</td>
                <td className="px-6 py-4">{req.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {req.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <form action={handleApprove}>
                        <input type="hidden" name="id" value={req.id} />
                        <button className="text-green-600 hover:underline">Approve</button>
                      </form>
                      <form action={handleReject}>
                        <input type="hidden" name="id" value={req.id} />
                        <button className="text-red-600 hover:underline">Reject</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <p className="p-6 text-center text-gray-500">No requests found.</p>}
      </div>
    </div>
  );
}
