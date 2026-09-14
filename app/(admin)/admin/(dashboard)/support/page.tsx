import { AdminSupportList } from '@/components/admin/AdminSupportList';

export default async function AdminSupportPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Support Inbox</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage customer inquiries and support tickets.</p>
        </div>
      </div>

      <AdminSupportList />
    </div>
  );
}
