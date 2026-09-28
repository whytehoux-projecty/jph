"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, Clock, Ban, CheckCircle2, Search, Filter } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { TransferReviewDrawer } from "./TransferReviewDrawer";

type TransactionWithUser = {
  id: string;
  reference: string;
  transactionType: string;
  type: string;
  amount: number;
  modifiedAmount: number | null;
  currency: string;
  status: string;
  description: string;
  metadata: string | null;
  methodId: string | null;
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

export function AdminTransferQueue({ 
  initialTransactions,
  onApprove,
  onReject,
}: { 
  initialTransactions: TransactionWithUser[];
  onApprove: (formData: FormData) => void;
  onReject: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState<TransactionWithUser | null>(null);

  const filtered = initialTransactions.filter((tx) => {
    const matchesSearch = 
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = methodFilter === "ALL" || tx.methodId === methodFilter || tx.transactionType === methodFilter;
    
    return matchesSearch && matchesMethod;
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No pending transfers found in queue.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs text-charcoal">{tx.reference}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {format(new Date(tx.createdAt), 'MMM d, HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal">{tx.account.user.firstName} {tx.account.user.lastName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{tx.account.accountNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{tx.methodId || tx.transactionType}</div>
                    <div className="text-xs text-muted-foreground">{tx.type}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-charcoal">
                    ${tx.amount.toFixed(2)}
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

      {selectedTx && (
        <TransferReviewDrawer 
          tx={selectedTx} 
          onClose={() => setSelectedTx(null)} 
          onApprove={onApprove} 
          onReject={onReject} 
        />
      )}
    </div>
  );
}
