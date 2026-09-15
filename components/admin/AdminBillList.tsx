"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ReceiptText, Search, Filter, Eye, CheckCircle2, XCircle } from "lucide-react";
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

type AdminBill = {
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
    }
  };
  payee: {
    name: string;
    accountNumber: string;
    category: string;
  }
};

export function AdminBillList({ 
  initialBills,
  onApprove,
  onReject
}: { 
  initialBills: AdminBill[];
  onApprove: (formData: FormData) => void;
  onReject: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBill, setSelectedBill] = useState<AdminBill | null>(null);

  const filtered = initialBills.filter((bill) => {
    const matchesSearch = 
      bill.payee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.account.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.account.user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search payee or customer name..." 
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            className="text-sm bg-neutral-50 border border-neutral-200 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Date Created</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payee (Biller)</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No bills found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(bill.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal">{bill.account.user.firstName} {bill.account.user.lastName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{bill.account.accountNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{bill.payee.name}</div>
                    <div className="text-xs text-muted-foreground uppercase">{bill.payee.category}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    ${bill.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      bill.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      bill.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {bill.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => setSelectedBill(bill)}
                      className="text-vintage-gold hover:text-vintage-gold hover:bg-vintage-gold/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <ReceiptText className="w-5 h-5" /> Bill Payment Review
            </DialogTitle>
            <DialogDescription>
              Review and process scheduled bill payments.
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-6 py-4">
              <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-medium text-charcoal">{selectedBill.account.user.firstName} {selectedBill.account.user.lastName}</p>
                    <p className="font-mono text-muted-foreground mt-1">{selectedBill.account.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Payee Info</p>
                    <p className="font-medium text-charcoal">{selectedBill.payee.name}</p>
                    <p className="font-mono text-muted-foreground mt-1">{selectedBill.payee.accountNumber}</p>
                  </div>
                  <div className="col-span-2 mt-2 pt-4 border-t border-neutral-200">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Amount</p>
                    <p className="font-bold text-2xl text-charcoal">${selectedBill.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBill.status === 'PENDING' && (
                <div className="flex items-center gap-3 justify-end pt-4 border-t border-neutral-200">
                  <form action={async (formData) => { await onReject(formData); setSelectedBill(null); }}>
                    <input type="hidden" name="id" value={selectedBill.id} />
                    <Button type="submit" variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-none shadow-none">
                      <XCircle className="w-4 h-4 mr-2" /> Reject Bill
                    </Button>
                  </form>
                  <form action={async (formData) => { await onApprove(formData); setSelectedBill(null); }}>
                    <input type="hidden" name="id" value={selectedBill.id} />
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Process Payment
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
