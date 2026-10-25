'use client';

import { useState } from 'react';
import { Landmark, ArrowDownToLine, Coins, Smartphone, CreditCard, CheckCircle2, XCircle, Search, Clock, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal } from '@/app/actions/admin-ebank';
import { toast } from 'sonner';

interface DepositItem {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  methodId: string;
  transactionType: string;
  createdAt: string;
  accountNumber: string;
  accountType: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  metadata?: string | null;
}

interface WithdrawalItem extends DepositItem {
  accountBalance: number;
}

function parseMeta(raw?: string | null): Record<string, any> {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const WITHDRAWAL_METHODS: Record<string, string> = {
  linked_ach: 'Transfer to external bank',
  pre_staged_counter: 'Branch cash order',
  cashiers_check: "Cashier's cheque by courier",
};

export function DepositsManagementClient({
  initialDeposits,
  initialWithdrawals,
  routingDetails,
  cryptoConfigs,
  locations,
}: {
  initialDeposits: DepositItem[];
  initialWithdrawals: WithdrawalItem[];
  routingDetails: any | null;
  cryptoConfigs: any[];
  locations: any[];
}) {
  const [deposits, setDeposits] = useState(initialDeposits);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'queue' | 'withdrawals' | 'routing' | 'crypto' | 'locations'>('queue');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredDeposits = deposits.filter((d) => {
    const matchesSearch =
      d.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveDeposit(id);
      setDeposits((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'APPROVED' } : d))
      );
      toast.success('Deposit approved and customer vault credited.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve deposit.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter institutional rejection reason:');
    if (!reason) return;

    setProcessingId(id);
    try {
      await rejectDeposit(id, reason);
      setDeposits((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'REJECTED' } : d))
      );
      toast.success('Deposit rejected and notice sent to customer.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject deposit.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawal = async (id: string, decision: 'approve' | 'reject') => {
    let reason = '';
    if (decision === 'reject') {
      reason = prompt('Reason shown to the customer:') || '';
      if (!reason) return;
    }
    setProcessingId(id);
    try {
      if (decision === 'approve') await approveWithdrawal(id);
      else await rejectWithdrawal(id, reason);
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: decision === 'approve' ? 'APPROVED' : 'REJECTED' } : w))
      );
      toast.success(decision === 'approve' ? 'Withdrawal approved and account debited.' : 'Withdrawal declined and customer notified.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to process withdrawal.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending Deposits</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1 flex items-center gap-2">
            {pendingCount}
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Action Required</span>
            )}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Volume</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            ${deposits.reduce((sum, d) => sum + (d.status === 'APPROVED' ? d.amount : 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Crypto Networks</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            {cryptoConfigs.length} Active
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Vault & ATM Hubs</div>
          <div className="text-2xl font-display font-bold text-ink-900 mt-1">
            {locations.length} Locations
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-1 bg-white px-4 pt-3 rounded-t-xl border-x border-t">
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('queue')}
        >
          <ArrowDownToLine className="w-4 h-4" /> Deposit Ingestion Queue ({deposits.length})
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'withdrawals'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawal Requests ({pendingWithdrawals} pending)
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'routing'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('routing')}
        >
          <Landmark className="w-4 h-4" /> Bank Wire / ACH Coordinates
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'crypto'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('crypto')}
        >
          <Coins className="w-4 h-4" /> Crypto Treasury Addresses
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'locations'
              ? 'border-ink-900 text-ink-900'
              : 'border-transparent text-neutral-500 hover:text-ink-900'
          }`}
          onClick={() => setActiveTab('locations')}
        >
          Vaults & Smart ATMs
        </button>
      </div>

      {/* TAB 1: QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference, customer name, email..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-ink-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Status:</span>
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
                  <TableHead>Reference & Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method & Channel</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Underwriting Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500 text-sm">
                      No deposit records match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeposits.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="font-mono font-bold text-xs text-ink-900">{d.reference}</div>
                        <div className="text-[11px] text-neutral-400">{new Date(d.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-ink-900">{d.customerName}</div>
                        <div className="text-xs text-neutral-500">{d.customerEmail}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{d.accountType} (••{d.accountNumber.slice(-4)})</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-800">
                          {d.transactionType}
                        </span>
                        <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{d.description}</div>
                        <ChequeImageLinks metadata={d.metadata} />
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm text-ink-900 font-mono">
                          ${d.amount.toLocaleString()} {d.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            d.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {d.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="small"
                              disabled={processingId === d.id}
                              onClick={() => handleApprove(d.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold px-3"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Credit
                            </Button>
                            <Button
                              size="small"
                              variant="outline"
                              disabled={processingId === d.id}
                              onClick={() => handleReject(d.id)}
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 text-xs font-semibold px-3"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 font-medium">Processed</span>
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

      {/* TAB: WITHDRAWAL REQUESTS */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-4">
          <p className="text-sm text-neutral-500">
            Requests customers made from the portal. Approving debits the account (refused if the balance no longer covers it); fulfil the transfer, cash order or cheque through normal operations.
          </p>
          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Reference & Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500 text-sm">
                      No withdrawal requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((w) => {
                    const m = parseMeta(w.metadata);
                    return (
                      <TableRow key={w.id}>
                        <TableCell>
                          <div className="font-mono font-bold text-xs text-ink-900">{w.reference}</div>
                          <div className="text-[11px] text-neutral-400">{new Date(w.createdAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-ink-900">{w.customerName}</div>
                          <div className="text-xs text-neutral-500">{w.customerEmail}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {w.accountType} (••{w.accountNumber.slice(-4)}) · balance ${w.accountBalance.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-neutral-700 space-y-0.5">
                          <div className="font-semibold">{WITHDRAWAL_METHODS[w.methodId] || w.methodId}</div>
                          {m.targetBankDetails && (
                            <div className="font-mono">
                              {m.targetBankDetails.bankName} · RTN {m.targetBankDetails.routingNumber} · {m.targetBankDetails.accountType} {m.targetBankDetails.accountNumber}
                            </div>
                          )}
                          {m.location && <div>{m.location.name}, {m.location.address}</div>}
                          {m.denominations && <div>Notes: {m.denominations}</div>}
                          {m.recipientName && <div>Payable to {m.recipientName}</div>}
                          {m.deliveryAddress && <div>Deliver to {m.deliveryAddress}</div>}
                          {m.notes && <div className="text-neutral-500">“{m.notes}”</div>}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm text-ink-900 font-mono">
                            ${w.amount.toLocaleString()} {w.currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                              w.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : w.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {w.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {w.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="small"
                                disabled={processingId === w.id}
                                onClick={() => handleWithdrawal(w.id, 'approve')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold px-3"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Debit
                              </Button>
                              <Button
                                size="small"
                                variant="outline"
                                disabled={processingId === w.id}
                                onClick={() => handleWithdrawal(w.id, 'reject')}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 text-xs font-semibold px-3"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400 font-medium">Processed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 2: ROUTING DETAILS */}
      {activeTab === 'routing' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-6">
          <div>
            <h4 className="font-bold text-lg text-ink-900">Institutional Bank Wire & ACH Coordinates</h4>
            <p className="text-sm text-neutral-500 mt-1">
              Active parameters displayed to account holders for external wire and electronic ACH transfers.
            </p>
          </div>
          {!routingDetails ? (
            <NotConfigured envVar="BANK_DEPOSIT_DETAILS">
              a JSON object with bankName, bankAddress, achRouting, wireRouting and optionally swiftBic. Until then customers are told to contact support for incoming transfer details.
            </NotConfigured>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-neutral-50">
              <span className="text-xs text-neutral-500 uppercase font-semibold">Financial Institution</span>
              <div className="font-bold text-base text-ink-900 mt-1">{routingDetails.bankName}</div>
            </div>
            <div className="p-4 border rounded-lg bg-neutral-50">
              <span className="text-xs text-neutral-500 uppercase font-semibold">ACH Routing (ABA)</span>
              <div className="font-mono font-bold text-base text-ink-900 mt-1">{routingDetails.achRouting}</div>
            </div>
            <div className="p-4 border rounded-lg bg-neutral-50">
              <span className="text-xs text-neutral-500 uppercase font-semibold">FedWire Routing</span>
              <div className="font-mono font-bold text-base text-ink-900 mt-1">{routingDetails.wireRouting}</div>
            </div>
            <div className="p-4 border rounded-lg bg-neutral-50">
              <span className="text-xs text-neutral-500 uppercase font-semibold">SWIFT / BIC Code</span>
              <div className="font-mono font-bold text-base text-ink-900 mt-1">{routingDetails.swiftBic || '—'}</div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* TAB 3: CRYPTO TREASURY */}
      {activeTab === 'crypto' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-6">
          <div>
            <h4 className="font-bold text-lg text-ink-900">Multi-Chain Stablecoin Treasury Addresses</h4>
            <p className="text-sm text-neutral-500 mt-1">
              Bank-controlled wallets shown to customers. Deposits are credited after staff confirm them on-chain.
            </p>
          </div>
          {cryptoConfigs.length === 0 && (
            <NotConfigured envVar="CRYPTO_DEPOSIT_CONFIGS">
              a JSON array of bank-controlled wallet addresses. Until then customers are told to contact support.
            </NotConfigured>
          )}
          <div className="grid grid-cols-1 gap-3">
            {cryptoConfigs.map((c, i) => (
              <div key={i} className="p-4 border rounded-lg bg-neutral-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink-900">{c.token}</span>
                    <span className="text-xs bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded font-mono font-semibold">
                      {c.networkLabel}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-neutral-600 mt-1 break-all">{c.address}</div>
                </div>
                <div className="text-right text-xs text-neutral-500">
                  <div>Min: ${c.minimumDeposit}</div>
                  <div>Confirmations: {c.confirmationsRequired}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="bg-white border border-neutral-200 rounded-b-xl shadow-sm p-6 space-y-6">
          <div>
            <h4 className="font-bold text-lg text-ink-900">Vault & Smart ATM Deposit Infrastructure</h4>
            <p className="text-sm text-neutral-500 mt-1">
              Physical drop points where customers can clear bulk cash or verified instrument deposits.
            </p>
          </div>
          {locations.length === 0 && (
            <NotConfigured envVar="DEPOSIT_LOCATIONS">
              a JSON array of branches: id, name, type (BRANCH or ATM), address, cityStateZip, hours. Until then cash deposits and branch cash orders aren&apos;t offered.
            </NotConfigured>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 border rounded-lg bg-neutral-50">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-sm text-ink-900">{loc.name}</h5>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
                    {loc.type}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">{loc.address}, {loc.cityStateZip}</p>
                <div className="text-[11px] text-neutral-500 mt-2 font-mono">Hours: {loc.hours}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Links to a cheque deposit's photos, served privately by /api/deposits/images. */
function ChequeImageLinks({ metadata }: { metadata?: string | null }) {
  const imgs = parseMeta(metadata).chequeImageIds;
  if (!imgs) return null;
  return (
    <div className="flex gap-3 mt-1 text-xs">
      <a className="underline text-ink-900" href={`/api/deposits/images/${imgs.front}`} target="_blank" rel="noopener noreferrer">
        Cheque front
      </a>
      <a className="underline text-ink-900" href={`/api/deposits/images/${imgs.back}`} target="_blank" rel="noopener noreferrer">
        Cheque back
      </a>
    </div>
  );
}

function NotConfigured({ envVar, children }: { envVar: string; children: React.ReactNode }) {
  return (
    <p className="text-sm text-neutral-600">
      Not configured. Set <code className="font-mono">{envVar}</code> to {children}
    </p>
  );
}
