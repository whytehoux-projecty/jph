import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AdminRequestList } from '@/components/admin/AdminRequestList';

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Internet Banking Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">Review requests for online banking access credentials.</p>
        </div>
      </div>

      <AdminRequestList 
        initialRequests={requests}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
