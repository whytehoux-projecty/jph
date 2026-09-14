"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowRightLeft, Search, Filter, Eye, CheckCircle2, XCircle, Ban } from "lucide-react";
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

type TransactionWithUser = {
  id: string;
  reference: string;
  transactionType: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  metadata: string | null;
  createdAt: Date;
  account: {
    accountNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

export function AdminTransactionList({ 
  initialTransactions,
  onApprove,
  onReject,
  onCancel
}: { 
  initialTransactions: TransactionWithUser[];
  onApprove: (formData: FormData) => void;
  onReject: (formData: FormData) => void;
  onCancel: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState<TransactionWithUser | null>(null);

  const filtered = initialTransactions.filter((tx) => {
    const matchesSearch = 
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;
    
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
            placeholder="Search reference or customer name..." 
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
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No transactions found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                  <TableCell className="text-sm">{format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{tx.account.user.firstName} {tx.account.user.lastName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{tx.account.accountNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{tx.transactionType.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground">{tx.type}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      tx.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      tx.status === 'CANCELLED' ? 'bg-neutral-100 text-neutral-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => setSelectedTx(tx)}
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
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" /> Transaction Review
            </DialogTitle>
            <DialogDescription>
              Reference: <span className="font-mono text-charcoal">{selectedTx?.reference}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-6 py-4">
              {/* Top info cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Customer Details</p>
                  <p className="font-medium text-charcoal">{selectedTx.account.user.firstName} {selectedTx.account.user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTx.account.user.email}</p>
                  <p className="text-sm font-mono text-muted-foreground mt-2">Acc: {selectedTx.account.accountNumber}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Transaction Summary</p>
                  <p className="font-bold text-2xl text-charcoal">${selectedTx.amount.toFixed(2)} <span className="text-sm text-muted-foreground font-normal">{selectedTx.currency}</span></p>
                  <p className="text-sm mt-1">{selectedTx.transactionType.replace('_', ' ')} ({selectedTx.type})</p>
                  <p className="text-xs text-muted-foreground mt-2">Initiated: {format(new Date(selectedTx.createdAt), 'PPP p')}</p>
                </div>
              </div>

              {/* Description & Metadata */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-charcoal bg-white p-3 rounded border border-neutral-200">{selectedTx.description}</p>
                
                {selectedTx.metadata && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Technical Metadata</p>
                    <pre className="bg-charcoal text-green-400 p-4 rounded border border-neutral-800 text-xs overflow-x-auto font-mono shadow-inner">
                      {JSON.stringify(JSON.parse(selectedTx.metadata), null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedTx.status === 'PENDING' && (
                <div className="flex items-center gap-3 justify-end pt-4 border-t border-neutral-200">
                  <form action={onCancel}>
                    <input type="hidden" name="id" value={selectedTx.id} />
                    <Button type="submit" variant="outline" className="text-neutral-600" onClick={() => setSelectedTx(null)}>
                      <Ban className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </form>
                  <form action={onReject}>
                    <input type="hidden" name="id" value={selectedTx.id} />
                    <Button type="submit" variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-none shadow-none" onClick={() => setSelectedTx(null)}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </form>
                  <form action={onApprove}>
                    <input type="hidden" name="id" value={selectedTx.id} />
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelectedTx(null)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Process
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
