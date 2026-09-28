"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, Eye } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  methodId: string | null;
  createdAt: Date;
  processedAt: Date | null;
  adminNote: string | null;
  rejectionReason: string | null;
  modifiedAmount: number | null;
  account: {
    accountNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

export function AdminTransferHistory({ 
  initialTransactions,
}: { 
  initialTransactions: TransactionWithUser[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  const filtered = initialTransactions.filter((tx) => {
    const matchesSearch = 
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;
    const matchesMethod = methodFilter === "ALL" || tx.methodId === methodFilter || tx.transactionType === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
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
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="ALL">All Methods</option>
            <option value="internal">Internal</option>
            <option value="ach">ACH</option>
            <option value="wire_domestic">Domestic Wire</option>
            <option value="wire_international">Intl Wire</option>
            <option value="crypto">Crypto</option>
            <option value="zelle">Zelle</option>
          </select>
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
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No historical transfers found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs text-charcoal">{tx.reference}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal">{tx.account.user.firstName} {tx.account.user.lastName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{tx.account.accountNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{tx.methodId || tx.transactionType}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-charcoal">
                    ${tx.modifiedAmount ? tx.modifiedAmount.toFixed(2) : tx.amount.toFixed(2)}
                    {tx.modifiedAmount && (
                      <span className="text-[10px] text-amber-600 block">Modified from ${tx.amount.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 
                      tx.status === 'CANCELLED' ? 'bg-neutral-100 text-neutral-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
