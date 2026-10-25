"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Building2, 
  ReceiptText, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Zap, 
  Phone, 
  Shield, 
  Home, 
  CreditCard, 
  Layers,
  Droplets,
  Tv,
  GraduationCap,
  Landmark,
  Check,
  Clock,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { 
  BILL_CATEGORIES, 
  BILL_REGIONS, 
  normalizeBillCategory, 
  normalizeBillCountry 
} from "@/lib/bill-constants";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export type AdminPayeeItem = {
  id: string;
  name: string;
  accountNumber: string;
  category: string;
  country: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type AdminBillItem = {
  id: string;
  amount: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  account: {
    id?: string;
    accountNumber: string;
    accountType?: string;
    balance?: number;
    currency?: string;
    user: {
      id?: string;
      firstName: string;
      lastName: string;
      email?: string;
    };
  };
  payee: {
    id?: string;
    name: string;
    accountNumber: string;
    category: string;
    country?: string;
  };
  /** Copy of the bill the customer attached, if any. */
  attachmentId?: string | null;
};

export function AdminBillServices({
  payees,
  bills,
  users,
  onCreatePayee,
  onDeletePayee,
  onApproveBill,
  onRejectBill,
}: {
  payees: AdminPayeeItem[];
  bills: AdminBillItem[];
  users: { id: string; firstName: string; lastName: string; email: string }[];
  onCreatePayee: (formData: FormData) => void;
  onDeletePayee: (formData: FormData) => void;
  onApproveBill: (formData: FormData) => void;
  onRejectBill: (formData: FormData) => void;
}) {
  const [activeTab, setActiveTab] = useState<'payees' | 'transactions'>('payees');
  
  // Payees Tab State
  const [payeeSearch, setPayeeSearch] = useState("");
  const [payeeCategoryFilter, setPayeeCategoryFilter] = useState("ALL");
  const [isAddPayeeOpen, setIsAddPayeeOpen] = useState(false);

  // Transactions Tab State
  const [billSearch, setBillSearch] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("ALL");
  const [selectedBill, setSelectedBill] = useState<AdminBillItem | null>(null);
  const [billToReject, setBillToReject] = useState<AdminBillItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Live Metrics Calculations
  const pendingBills = bills.filter((b) => b.status === 'PENDING');
  const pendingAmount = pendingBills.reduce((sum, b) => sum + b.amount, 0);
  const settledBills = bills.filter((b) => b.status === 'PAID');
  const settledAmount = settledBills.reduce((sum, b) => sum + b.amount, 0);
  const rejectedBills = bills.filter((b) => b.status === 'REJECTED');

  // Filtered Payees
  const filteredPayees = payees.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.accountNumber.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.user.firstName.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.user.lastName.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.user.email.toLowerCase().includes(payeeSearch.toLowerCase());
    const matchesCategory = 
      payeeCategoryFilter === "ALL" || 
      normalizeBillCategory(p.category) === normalizeBillCategory(payeeCategoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Filtered Bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch = 
      b.payee.name.toLowerCase().includes(billSearch.toLowerCase()) ||
      b.account.user.lastName.toLowerCase().includes(billSearch.toLowerCase()) ||
      b.account.user.firstName.toLowerCase().includes(billSearch.toLowerCase()) ||
      b.account.accountNumber.includes(billSearch);
    const matchesStatus = billStatusFilter === "ALL" || b.status === billStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryIcon = (category: string) => {
    const norm = normalizeBillCategory(category);
    switch (norm) {
      case 'UTILITIES':
        return <Zap className="w-3.5 h-3.5 text-amber-600" />;
      case 'TELECOM':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'WATER':
        return <Droplets className="w-3.5 h-3.5 text-cyan-600" />;
      case 'TV':
        return <Tv className="w-3.5 h-3.5 text-violet-600" />;
      case 'INSURANCE':
        return <Shield className="w-3.5 h-3.5 text-emerald-600" />;
      case 'CREDIT':
        return <CreditCard className="w-3.5 h-3.5 text-rose-600" />;
      case 'RENT':
        return <Home className="w-3.5 h-3.5 text-purple-600" />;
      case 'EDUCATION':
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />;
      case 'COUNCIL':
        return <Landmark className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-neutral-600" />;
    }
  };

  const handleApproveWithFeedback = async (formData: FormData) => {
    setIsProcessing(true);
    try {
      await onApproveBill(formData);
      toast.success("Bill payment approved and account debited successfully.");
      if (selectedBill) setSelectedBill(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to approve payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectWithFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billToReject) return;
    setIsProcessing(true);
    try {
      const fd = new FormData();
      fd.append("id", billToReject.id);
      fd.append("reason", rejectReason || "Declined by bank administrator during verification.");
      await onRejectBill(fd);
      toast.success("Payment request rejected and customer notified.");
      setBillToReject(null);
      setRejectReason("");
      if (selectedBill) setSelectedBill(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to reject bill.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Active Providers
            </span>
            <span className="text-2xl font-bold font-display text-ink-900 mt-1 block">
              {payees.length}
            </span>
            <span className="text-xs text-neutral-500 mt-0.5 block">
              Billers saved for customers
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-neutral-100 flex items-center justify-center text-ink-900">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
              Pending Approvals
            </span>
            <span className="text-2xl font-bold font-display text-amber-900 mt-1 block">
              {pendingBills.length}
            </span>
            <span className="text-xs text-amber-700 mt-0.5 block font-mono">
              ${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} volume
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Settled Volume
            </span>
            <span className="text-2xl font-bold font-display text-emerald-900 mt-1 block font-mono">
              ${settledAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-700 mt-0.5 block">
              {settledBills.length} cleared bills
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Rejected Requests
            </span>
            <span className="text-2xl font-bold font-display text-neutral-800 mt-1 block">
              {rejectedBills.length}
            </span>
            <span className="text-xs text-neutral-500 mt-0.5 block">
              Declined during clearance
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('payees')}
          className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payees'
              ? 'border-vintage-gold text-ink-900 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-ink-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Service Providers (Payees)
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-ink-900 font-bold">
            {payees.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'transactions'
              ? 'border-vintage-gold text-ink-900 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-ink-900'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          Payment Transactions & Approvals
          {pendingBills.length > 0 ? (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900 font-bold">
              {pendingBills.length} Pending
            </span>
          ) : (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-ink-900 font-bold">
              {bills.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SERVICE PROVIDERS (PAYEES) */}
      {activeTab === 'payees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-xs border border-neutral-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search service provider, account, or customer..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                value={payeeSearch}
                onChange={(e) => setPayeeSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  className="text-sm bg-neutral-50 border border-neutral-200 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                  value={payeeCategoryFilter}
                  onChange={(e) => setPayeeCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {BILL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsAddPayeeOpen(true)}
                className="flex items-center gap-1.5 bg-ink-900 text-white hover:bg-ink-900/90"
              >
                <Plus className="w-4 h-4" /> Add Provider
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Service Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account / Biller ID</TableHead>
                  <TableHead>Target Customer Profile</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No service providers or payees found in the database. Click "Add Provider" to create a live biller.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayees.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-ink-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span>{p.name}</span>
                          <span className="block text-[11px] text-muted-foreground font-mono">ID: {p.id.substring(0, 10)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-ink-900 border border-neutral-200">
                          {getCategoryIcon(p.category)}
                          {p.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{p.accountNumber}</TableCell>
                      <TableCell className="text-sm">
                        <span className="font-medium text-ink-900">{p.user.firstName} {p.user.lastName}</span>
                        <span className="block text-xs text-muted-foreground">{p.user.email}</span>
                      </TableCell>
                      <TableCell className="text-sm uppercase font-mono">{p.country}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(p.createdAt), 'PP')}
                      </TableCell>
                      <TableCell className="text-right">
                        <form 
                          action={async (fd) => {
                            await onDeletePayee(fd);
                            toast.success(`Removed provider ${p.name}`);
                          }} 
                          onSubmit={(e) => {
                            if (!confirm(`Are you sure you want to remove ${p.name}? This will affect customer biller directories.`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={p.id} />
                          <Button variant="ghost" size="small" type="submit" className="text-red-600 hover:bg-red-50 h-8">
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT TRANSACTIONS & APPROVALS */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-xs border border-neutral-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search payee, customer name, or account..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                value={billSearch}
                onChange={(e) => setBillSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                className="text-sm bg-neutral-50 border border-neutral-200 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                value={billStatusFilter}
                onChange={(e) => setBillStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="PAID">Paid / Cleared</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Payee / Provider</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Source Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bill payments found matching your search filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-semibold text-ink-900">
                        {b.payee.name}
                        <span className="block text-xs text-muted-foreground">
                          {b.payee.category} · Acct: {b.payee.accountNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-ink-900">
                          {b.account.user.firstName} {b.account.user.lastName}
                        </span>
                        {b.account.user.email && (
                          <span className="block text-xs text-muted-foreground">{b.account.user.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <span className="font-bold text-ink-900">{b.account.accountNumber}</span>
                        {b.account.accountType && (
                          <span className="block text-xs text-muted-foreground capitalize">
                            {b.account.accountType.toLowerCase()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-ink-900 font-mono">
                        ${b.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {b.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Cleared
                          </span>
                        ) : b.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> Pending Approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(b.createdAt), 'PP')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => setSelectedBill(b)}
                            className="h-8"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                          {b.status === 'PENDING' && (
                            <>
                              <form action={handleApproveWithFeedback}>
                                <input type="hidden" name="id" value={b.id} />
                                <Button
                                  variant="primary"
                                  size="small"
                                  type="submit"
                                  disabled={isProcessing}
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                              </form>
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => {
                                  setBillToReject(b);
                                  setRejectReason("");
                                }}
                                className="h-8 text-rose-600 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* CREATE PAYEE MODAL */}
      <Dialog open={isAddPayeeOpen} onOpenChange={setIsAddPayeeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ink-900">
              <Building2 className="w-5 h-5 text-vintage-gold" />
              Add Service Provider / Payee
            </DialogTitle>
            <DialogDescription>
              Save a biller for one customer, with their account or reference number at that biller.
            </DialogDescription>
          </DialogHeader>

          <form
            action={async (formData: FormData) => {
              await onCreatePayee(formData);
              toast.success("Service provider added to database.");
              setIsAddPayeeOpen(false);
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <label className="text-xs font-semibold text-ink-900 block mb-1">
                Provider / Payee Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Consolidated Edison, AT&T, State Farm"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-900 block mb-1">
                Account / Biller Identifier *
              </label>
              <input
                type="text"
                name="accountNumber"
                required
                placeholder="e.g. 1002938475 or BILLER-DIRECT"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-900 block mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  defaultValue="UTILITIES"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                >
                  {BILL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-900 block mb-1">
                  Jurisdiction / Country *
                </label>
                <select
                  name="country"
                  defaultValue="usa"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                >
                  {BILL_REGIONS.filter((r) => r.value !== "all").map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-900 block mb-1">
                Customer *
              </label>
              <select
                name="userId"
                required
                defaultValue=""
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              >
                <option value="" disabled>Choose a customer</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-muted-foreground block mt-1">
                The biller appears only in this customer&apos;s Bills page. The identifier is their account or reference number with the biller.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" onClick={() => setIsAddPayeeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-ink-900 text-white">
                Save Service Provider
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* BILL DETAILS MODAL */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-md">
          {selectedBill && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-ink-900">
                  <ReceiptText className="w-5 h-5 text-vintage-gold" />
                  Bill Payment Review & Verification
                </DialogTitle>
                <DialogDescription>
                  Detailed breakdown of scheduled customer payment request.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4 text-sm">
                <div className="bg-neutral-50 p-4 rounded-lg space-y-2.5 border border-neutral-200">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bill Record ID:</span>
                    <span className="font-mono text-xs text-ink-900">{selectedBill.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payee Name:</span>
                    <span className="font-semibold text-ink-900">{selectedBill.payee.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium text-ink-900">{selectedBill.payee.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Biller Account / ID:</span>
                    <span className="font-mono text-ink-900 font-bold">{selectedBill.payee.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-neutral-200 pt-2">
                    <span className="text-muted-foreground">Customer Profile:</span>
                    <span className="font-semibold text-ink-900">
                      {selectedBill.account.user.firstName} {selectedBill.account.user.lastName}
                    </span>
                  </div>
                  {selectedBill.account.user.email && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-ink-900">{selectedBill.account.user.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Debiting Account:</span>
                    <span className="font-mono text-ink-900 font-semibold">{selectedBill.account.accountNumber}</span>
                  </div>
                  {selectedBill.account.balance !== undefined && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Current Account Balance:</span>
                      <span className="font-mono font-bold text-ink-900">
                        ${selectedBill.account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {selectedBill.attachmentId && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Attached bill:</span>
                      <a
                        href={`/api/bills/attachments/${selectedBill.attachmentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-ink-900 underline"
                      >
                        Open
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-neutral-200 pt-2.5">
                    <span className="text-ink-900 font-bold">Payment Amount:</span>
                    <span className="font-bold text-xl text-ink-900 font-mono">
                      ${selectedBill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Submitted: {format(new Date(selectedBill.createdAt), 'PPpp')}</span>
                  {selectedBill.paidAt && (
                    <span className="text-emerald-700 font-semibold">Cleared: {format(new Date(selectedBill.paidAt), 'PPpp')}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                {selectedBill.status === 'PENDING' ? (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setBillToReject(selectedBill);
                        setRejectReason("");
                      }}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Reject Payment
                    </Button>
                    <form action={handleApproveWithFeedback}>
                      <input type="hidden" name="id" value={selectedBill.id} />
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={isProcessing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve & Clear
                      </Button>
                    </form>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedBill(null)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REJECT WITH REASON MODAL */}
      <Dialog open={!!billToReject} onOpenChange={(open) => !open && setBillToReject(null)}>
        <DialogContent className="max-w-md">
          {billToReject && (
            <form onSubmit={handleRejectWithFeedback} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Decline Bill Payment
                </DialogTitle>
                <DialogDescription>
                  Specify a reason for declining ${billToReject.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to {billToReject.payee.name}. The customer will receive this message in their portal inbox.
                </DialogDescription>
              </DialogHeader>

              <div>
                <label className="text-xs font-semibold text-ink-900 block mb-1">
                  Rejection Reason / Note to Customer
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Account number could not be validated with provider network, or insufficient cleared funds."
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setBillToReject(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isProcessing} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Confirm Decline
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
