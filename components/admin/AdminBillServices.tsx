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
  Check
} from "lucide-react";
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
    accountNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  payee: {
    name: string;
    accountNumber: string;
    category: string;
  };
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

  // Filtered Payees
  const filteredPayees = payees.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.accountNumber.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.user.firstName.toLowerCase().includes(payeeSearch.toLowerCase()) ||
      p.user.lastName.toLowerCase().includes(payeeSearch.toLowerCase());
    const matchesCategory = payeeCategoryFilter === "ALL" || p.category.toUpperCase() === payeeCategoryFilter;
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
    switch (category.toUpperCase()) {
      case 'UTILITIES':
        return <Zap className="w-3.5 h-3.5 text-amber-600" />;
      case 'TELECOM':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'INSURANCE':
        return <Shield className="w-3.5 h-3.5 text-emerald-600" />;
      case 'RENT':
        return <Home className="w-3.5 h-3.5 text-purple-600" />;
      case 'CREDIT_CARD':
        return <CreditCard className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('payees')}
          className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'payees'
              ? 'border-vintage-gold text-charcoal font-semibold'
              : 'border-transparent text-muted-foreground hover:text-charcoal'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Service Providers (Payees)
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-charcoal font-bold">
            {payees.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-vintage-gold text-charcoal font-semibold'
              : 'border-transparent text-muted-foreground hover:text-charcoal'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          Payment Transactions & Approvals
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-charcoal font-bold">
            {bills.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SERVICE PROVIDERS (PAYEES) */}
      {activeTab === 'payees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search service provider or account..."
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
                  <option value="UTILITIES">Utilities</option>
                  <option value="TELECOM">Telecom</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="RENT">Rent & Housing</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsAddPayeeOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Provider
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Service Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account / Biller ID</TableHead>
                  <TableHead>Customer User</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No service providers or payees found. Click "Add Provider" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayees.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-charcoal flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {p.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-charcoal border border-neutral-200">
                          {getCategoryIcon(p.category)}
                          {p.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{p.accountNumber}</TableCell>
                      <TableCell className="text-sm">
                        <span className="font-medium text-charcoal">{p.user.firstName} {p.user.lastName}</span>
                        <span className="block text-xs text-muted-foreground">{p.user.email}</span>
                      </TableCell>
                      <TableCell className="text-sm uppercase font-mono">{p.country}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(p.createdAt), 'PP')}
                      </TableCell>
                      <TableCell className="text-right">
                        <form 
                          action={onDeletePayee} 
                          onSubmit={(e) => {
                            if (!confirm(`Are you sure you want to remove ${p.name}? This will affect scheduled payments.`)) {
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
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search payee or customer name..."
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
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Payee / Provider</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Source Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bill payments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-semibold text-charcoal">
                        {b.payee.name}
                        <span className="block text-xs text-muted-foreground">{b.payee.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-charcoal">
                          {b.account.user.firstName} {b.account.user.lastName}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{b.account.accountNumber}</TableCell>
                      <TableCell className="font-bold text-charcoal">
                        ${b.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {b.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        ) : b.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
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
                              <form action={onApproveBill}>
                                <input type="hidden" name="id" value={b.id} />
                                <Button
                                  variant="primary"
                                  size="small"
                                  type="submit"
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                              </form>
                              <form action={onRejectBill}>
                                <input type="hidden" name="id" value={b.id} />
                                <Button
                                  variant="outline"
                                  size="small"
                                  type="submit"
                                  className="h-8 text-red-600 hover:bg-red-50"
                                >
                                  Reject
                                </Button>
                              </form>
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
            <DialogTitle className="flex items-center gap-2 text-charcoal">
              <Building2 className="w-5 h-5 text-vintage-gold" />
              Add Service Provider / Payee
            </DialogTitle>
            <DialogDescription>
              Register a utility, telecom, insurance, or general biller service provider.
            </DialogDescription>
          </DialogHeader>

          <form
            action={async (formData: FormData) => {
              await onCreatePayee(formData);
              setIsAddPayeeOpen(false);
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">
                Provider / Payee Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Con Edison, AT&T, State Farm"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">
                Account / Biller Identifier *
              </label>
              <input
                type="text"
                name="accountNumber"
                required
                placeholder="e.g. 1002938475"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue="UTILITIES"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                >
                  <option value="UTILITIES">Utilities</option>
                  <option value="TELECOM">Telecom</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="RENT">Rent & Housing</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  defaultValue="usa"
                  className="w-full px-3 py-2 text-sm uppercase bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">
                Assign to Customer Profile
              </label>
              <select
                name="userId"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-muted-foreground block mt-1">
                Payees in the system are associated with a customer account profile.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" onClick={() => setIsAddPayeeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
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
                <DialogTitle className="flex items-center gap-2 text-charcoal">
                  <ReceiptText className="w-5 h-5 text-vintage-gold" />
                  Bill Payment Review
                </DialogTitle>
                <DialogDescription>
                  Detailed breakdown of scheduled payment request.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4 text-sm">
                <div className="bg-neutral-50 p-4 rounded-lg space-y-2 border border-neutral-100">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payee Name:</span>
                    <span className="font-semibold text-charcoal">{selectedBill.payee.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium text-charcoal">{selectedBill.payee.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payee Account:</span>
                    <span className="font-mono text-charcoal">{selectedBill.payee.accountNumber}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-2">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-semibold text-charcoal">
                      {selectedBill.account.user.firstName} {selectedBill.account.user.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Debiting Account:</span>
                    <span className="font-mono text-charcoal">{selectedBill.account.accountNumber}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-2">
                    <span className="text-muted-foreground font-semibold">Payment Amount:</span>
                    <span className="font-bold text-lg text-charcoal">
                      ${selectedBill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Submitted: {format(new Date(selectedBill.createdAt), 'PPpp')}</span>
                  {selectedBill.paidAt && (
                    <span>Processed: {format(new Date(selectedBill.paidAt), 'PPpp')}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                {selectedBill.status === 'PENDING' ? (
                  <>
                    <form 
                      action={async (fd) => {
                        await onRejectBill(fd);
                        setSelectedBill(null);
                      }}
                    >
                      <input type="hidden" name="id" value={selectedBill.id} />
                      <Button type="submit" variant="outline" className="text-red-600">
                        Reject
                      </Button>
                    </form>
                    <form 
                      action={async (fd) => {
                        await onApproveBill(fd);
                        setSelectedBill(null);
                      }}
                    >
                      <input type="hidden" name="id" value={selectedBill.id} />
                      <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Approve Payment
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
    </div>
  );
}
