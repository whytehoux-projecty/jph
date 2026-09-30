const fs = require('fs');

const adminActions = `
export async function adminCreateBeneficiary(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const nickname = formData.get('nickname') as string;
  const rail = formData.get('rail') as string;
  const details = formData.get('details') as string;
  const status = formData.get('status') as string || 'ACTIVE';
  const notes = formData.get('notes') as string;
  const adminName = (session?.user as any)?.name || 'Admin';

  const auditEntry = {
    date: new Date().toISOString(),
    admin: adminName,
    action: 'CREATED',
    changes: 'Initial creation by admin'
  };

  await prisma.beneficiary.create({
    data: {
      userId,
      name,
      nickname,
      rail,
      details,
      status,
      notes,
      auditTrail: JSON.stringify([auditEntry])
    }
  });

  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/admin/customers/portal-users');
}

export async function adminUpdateBeneficiary(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const nickname = formData.get('nickname') as string;
  const rail = formData.get('rail') as string;
  const details = formData.get('details') as string;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string;
  const adminName = (session?.user as any)?.name || 'Admin';

  const existing = await prisma.beneficiary.findUnique({ where: { id } });
  if (!existing) throw new Error('Not found');

  const oldAudit = existing.auditTrail ? JSON.parse(existing.auditTrail) : [];
  oldAudit.push({
    date: new Date().toISOString(),
    admin: adminName,
    action: 'UPDATED',
    changes: 'Admin updated details/status'
  });

  await prisma.beneficiary.update({
    where: { id },
    data: {
      name,
      nickname,
      rail,
      details,
      status,
      notes,
      auditTrail: JSON.stringify(oldAudit)
    }
  });

  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/admin/customers/portal-users');
}

export async function adminDeleteBeneficiary(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const id = formData.get('id') as string;
  const adminName = (session?.user as any)?.name || 'Admin';

  const existing = await prisma.beneficiary.findUnique({ where: { id } });
  if (!existing) throw new Error('Not found');

  const oldAudit = existing.auditTrail ? JSON.parse(existing.auditTrail) : [];
  oldAudit.push({
    date: new Date().toISOString(),
    admin: adminName,
    action: 'DELETED',
    changes: 'Soft deleted by admin'
  });

  await prisma.beneficiary.update({
    where: { id },
    data: { 
      deletedAt: new Date(),
      auditTrail: JSON.stringify(oldAudit)
    }
  });

  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/admin/customers/portal-users');
}
`;

fs.appendFileSync('app/actions/admin-customers.ts', adminActions);
console.log('Appended admin actions');
