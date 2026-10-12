'use client';

import { useState } from 'react';
import { Gift, Sparkles, Crown, Briefcase, Compass, CheckCircle2, Clock, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { resolveBenefitTicket } from '@/app/actions/admin-ebank';
import { toast } from 'sonner';

interface BenefitData {
  redemptions: any[];
  tickets: any[];
  users: any[];
}

export function BenefitsManagementClient({
  initialData,
}: {
  initialData: BenefitData;
}) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<'tickets' | 'redemptions' | 'users'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredTickets = data.tickets.filter((t) =>
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResolveTicket = async (id: string) => {
    const notes = prompt('Enter resolution response or appointment confirmation notes:');
    if (!notes) return;

    setProcessingId(id);
    try {
      await resolveBenefitTicket(id, notes);
      setData((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) => (t.id === id ? { ...t, status: 'RESOLVED' } : t)),
      }));
      toast.success('Ticket resolved and confirmation sent to customer.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to resolve ticket.');
    } finally {
      setProcessingId(null);
    }
  };

  const openTickets = data.tickets.filter((t) => t.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Open Concierge & Advisory</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1 flex items-center gap-2">
            {openTickets}
            {openTickets > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">VIP Inquiries</span>
            )}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Points Redemptions</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            {data.redemptions.length} Completed
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Cash Redemptions Total</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            ${data.redemptions.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Enrolled Vault Members</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            {data.users.length} Clients
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-1 bg-white px-4 pt-3 rounded-t-xl border-x border-t">
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('tickets')}
        >
          <Compass className="w-4 h-4" /> Concierge & Advisory Requests ({data.tickets.length})
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'redemptions'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('redemptions')}
        >
          <Sparkles className="w-4 h-4" /> Points Redemptions Ledger ({data.redemptions.length})
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Crown className="w-4 h-4" /> Relationship Tiers
        </button>
      </div>

      {/* TAB 1: TICKETS */}
      {activeTab === 'tickets' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search VIP request or client name..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-ink-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Type & Service</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Message & Agenda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Desk Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-neutral-500 text-sm">
                      No advisory or concierge inquiries in queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                            t.isAdvisory
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {t.isAdvisory ? 'PRIVATE ADVISORY' : 'LIFESTYLE CONCIERGE'}
                        </span>
                        <div className="text-[11px] text-neutral-400 mt-1">
                          {new Date(t.createdAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-ink-900">{t.customerName}</div>
                        <div className="text-xs text-neutral-500">{t.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-ink-900">{t.subject}</div>
                        <p className="text-xs text-neutral-600 whitespace-pre-line mt-1 line-clamp-3">
                          {t.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.status === 'OPEN' ? (
                          <Button
                            size="small"
                            disabled={processingId === t.id}
                            onClick={() => handleResolveTicket(t.id)}
                            className="bg-ink-900 hover:bg-black text-white h-8 text-xs font-semibold px-3"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Fulfill / Confirm
                          </Button>
                        ) : (
                          <span className="text-xs text-neutral-400 font-medium">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 2: REDEMPTIONS */}
      {activeTab === 'redemptions' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-4">
          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Reference & Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Redemption Category</TableHead>
                  <TableHead>Statement Credit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.redemptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-neutral-500 text-sm">
                      No points redemptions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.redemptions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-mono font-bold text-xs text-ink-900">{r.reference}</div>
                        <div className="text-[11px] text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-ink-900">{r.customerName}</div>
                        <div className="text-xs text-neutral-500">{r.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-neutral-700">{r.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm text-emerald-700 font-mono">
                          +${r.amount.toLocaleString()} USD
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                          {r.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 3: TIERS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-4">
          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Relationship Tier</TableHead>
                  <TableHead>Perks Multiplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-sm text-ink-900">
                      {u.firstName} {u.lastName}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500">{u.email}</TableCell>
                    <TableCell>
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded uppercase">
                        {u.tier || 'WORLD_ELITE'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-600 font-mono">
                      3x Dining & Travel • 2x Business • 1.5x Vault Assets
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
