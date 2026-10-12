'use client';

import { useState } from 'react';
import { BadgeDollarSign, CheckCircle2, XCircle, Search, Clock, ArrowRight, ShieldCheck, ShieldAlert, Landmark, Building2, Car, Home, Wallet, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { approveAndDisburseLoan, rejectLoan } from '@/app/actions/admin-ebank';
import { toast } from 'sonner';

interface LoanItem {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  methodId: string | null;
  createdAt: string;
  accountNumber: string;
  accountType: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  metadata: string | null;
}

export function LoansManagementClient({
  initialLoans,
  loanProducts,
}: {
  initialLoans: LoanItem[];
  loanProducts: any[];
}) {
  const [loans, setLoans] = useState(initialLoans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'applications' | 'products'>('applications');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredLoans = loans.filter((l) => {
    const matchesSearch =
      l.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDisburse = async (id: string, amount: number) => {
    if (!confirm(`Are you sure you want to approve this loan application and instantly disburse $${amount.toLocaleString()} into the customer's vault account?`)) {
      return;
    }

    setProcessingId(id);
    try {
      await approveAndDisburseLoan(id);
      setLoans((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'APPROVED' } : l))
      );
      toast.success(`Loan approved! $${amount.toLocaleString()} disbursed to customer account.`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to disburse loan.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter credit underwriting decline reason:');
    if (!reason) return;

    setProcessingId(id);
    try {
      await rejectLoan(id, reason);
      setLoans((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'REJECTED' } : l))
      );
      toast.success('Loan application rejected and notification delivered.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject loan.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = loans.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Underwriting Queue</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1 flex items-center gap-2">
            {pendingCount}
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Awaiting Decision</span>
            )}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Lending Portfolio Funded</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            ${loans.reduce((sum, l) => sum + (l.status === 'APPROVED' ? l.amount : 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Lending Programs</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            {loanProducts.length} Programs
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Approval Rate</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            {loans.length > 0
              ? `${Math.round((loans.filter((l) => l.status === 'APPROVED').length / loans.length) * 100)}%`
              : '100%'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-1 bg-white px-4 pt-3 rounded-t-xl border-x border-t">
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('applications')}
        >
          <BadgeDollarSign className="w-4 h-4" /> Credit Underwriting Queue ({loans.length})
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('products')}
        >
          <Building2 className="w-4 h-4" /> Institutional Loan Catalog & Rates
        </button>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference, borrower name, email..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-ink-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Filter:</span>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors ${
                    statusFilter === st
                      ? 'bg-ink-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Application Ref</TableHead>
                  <TableHead>Borrower Details</TableHead>
                  <TableHead>Facility & Purpose</TableHead>
                  <TableHead>Principal Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Underwriting Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500 text-sm">
                      No loan applications match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-mono font-bold text-xs text-ink-900">{l.reference}</div>
                        <div className="text-[11px] text-neutral-400">{new Date(l.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-ink-900">{l.customerName}</div>
                        <div className="text-xs text-neutral-500">{l.customerEmail}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">Disburse To: {l.accountType} (••{l.accountNumber.slice(-4)})</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {l.methodId?.toUpperCase() || 'LOAN'}
                        </span>
                        <div className="text-xs text-neutral-600 mt-1 line-clamp-1">{l.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm text-ink-900 font-mono">
                          ${l.amount.toLocaleString()} {l.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            l.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {l.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {l.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="small"
                              disabled={processingId === l.id}
                              onClick={() => handleDisburse(l.id, l.amount)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold px-3"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Disburse
                            </Button>
                            <Button
                              size="small"
                              variant="outline"
                              disabled={processingId === l.id}
                              onClick={() => handleReject(l.id)}
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 text-xs font-semibold px-3"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 font-medium">Underwritten</span>
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

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-6">
          <div>
            <h4 className="font-bold text-lg text-ink-900">Active Lending Facilities & Rate Tables</h4>
            <p className="text-sm text-neutral-500 mt-1">
              Live commercial & private banking credit programs presented in the client portal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loanProducts.map((p) => (
              <div key={p.id} className="p-5 border rounded-lg bg-neutral-50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-base text-ink-900">{p.name}</h5>
                    <p className="text-xs text-neutral-500 mt-0.5">{p.headline}</p>
                  </div>
                  <span className="text-xs font-bold font-mono bg-white border border-neutral-300 px-2 py-1 rounded text-vintage-gold">
                    {p.aprDisplay}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-neutral-200 pt-3">
                  <div>
                    <span className="text-neutral-400">Credit Limit:</span>
                    <div className="font-semibold text-ink-900 font-mono">${(p.maxAmount / 1000).toFixed(0)}k Max</div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Origination Fee:</span>
                    <div className="font-semibold text-ink-900 font-mono">{p.originationFee}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
