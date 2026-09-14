import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export default async function AccountApplications() {
  const applications = await prisma.accountApplication.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const handleApprove = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string;
    const app = await prisma.accountApplication.findUnique({ where: { id } });
    if (!app) return;
    
    // Create the mock user
    const user = await prisma.user.create({
      data: {
        email: app.email,
        password: 'password123', // Default mock password
        firstName: app.firstName,
        lastName: app.lastName,
        phone: app.phone,
        dateOfBirth: app.dateOfBirth,
        status: 'ACTIVE',
      }
    });

    // Create the mock account
    await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        accountType: app.applicationType,
        balance: 0.00
      }
    });

    // Update application
    await prisma.accountApplication.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() }
    });

    revalidatePath('/admin/applications');
  };

  const handleReject = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string;
    await prisma.accountApplication.update({
      where: { id },
      data: { status: 'REJECTED', reviewedAt: new Date() }
    });
    revalidatePath('/admin/applications');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account Applications</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b-2 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b dark:border-neutral-600">
                <td className="px-6 py-4">{app.firstName} {app.lastName}</td>
                <td className="px-6 py-4">{app.email}</td>
                <td className="px-6 py-4">{app.applicationType}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {app.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <form action={handleApprove}>
                        <input type="hidden" name="id" value={app.id} />
                        <button className="text-green-600 hover:underline">Approve</button>
                      </form>
                      <form action={handleReject}>
                        <input type="hidden" name="id" value={app.id} />
                        <button className="text-red-600 hover:underline">Reject</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <p className="p-6 text-center text-gray-500">No applications found.</p>}
      </div>
    </div>
  );
}
