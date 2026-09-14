"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Building2, Search, Filter, Settings2, ShieldBan, ShieldCheck, Wallet } from "lucide-react";
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

type AdminAccount = {
  id: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: number;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export function AdminAccountList({ 
  initialAccounts,
  onToggleStatus,
  onUpdateBalance
}: { 
  initialAccounts: AdminAccount[];
  onToggleStatus: (formData: FormData) => void;
  onUpdateBalance: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAcc, setSelectedAcc] = useState<AdminAccount | null>(null);
  const [balanceInput, setBalanceInput] = useState("");

  const filtered = initialAccounts.filter((acc) => {
    const matchesSearch = 
      acc.accountNumber.includes(searchTerm) ||
      acc.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || acc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openManage = (acc: AdminAccount) => {
    setSelectedAcc(acc);
    setBalanceInput(acc.balance.toString());
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search account number or customer name..." 
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
            <option value="ACTIVE">Active</option>
            <option value="FROZEN">Frozen</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No accounts found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono font-medium">{acc.accountNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium text-charcoal">{acc.user.firstName} {acc.user.lastName}</div>
                    <div className="text-xs text-muted-foreground">{acc.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md font-medium uppercase tracking-wide">
                      {acc.accountType}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    ${acc.balance.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      acc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      acc.status === 'FROZEN' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {acc.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => openManage(acc)}
                      className="text-vintage-gold hover:text-vintage-gold hover:bg-vintage-gold/10"
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedAcc} onOpenChange={(open) => !open && setSelectedAcc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Account Management
            </DialogTitle>
            <DialogDescription>
              Adjust account controls and balances.
            </DialogDescription>
          </DialogHeader>

          {selectedAcc && (
            <div className="space-y-6 py-4">
              <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-mono text-xl font-bold text-charcoal">{selectedAcc.accountNumber}</h3>
                    <p className="text-sm font-medium uppercase text-muted-foreground">{selectedAcc.accountType} Account</p>
                    <p className="text-sm text-charcoal mt-2">Owner: {selectedAcc.user.firstName} {selectedAcc.user.lastName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider mb-2 ${
                      selectedAcc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      selectedAcc.status === 'FROZEN' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedAcc.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Editor Form */}
              <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Demo Controls: Manual Balance Override</h4>
                <form action={onUpdateBalance} className="flex gap-3 items-end">
                  <input type="hidden" name="id" value={selectedAcc.id} />
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-charcoal">New Balance ($)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="balance" 
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-charcoal hover:bg-neutral-800 text-white shrink-0" onClick={() => setSelectedAcc(null)}>
                    <Wallet className="w-4 h-4 mr-2" /> Update
                  </Button>
                </form>
                <p className="text-[10px] text-muted-foreground">Warning: This bypasses ledger transactions and directly overwrites the account balance in the database. Use for testing/demo purposes only.</p>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
                <form action={onToggleStatus}>
                  <input type="hidden" name="id" value={selectedAcc.id} />
                  <input type="hidden" name="status" value={selectedAcc.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE'} />
                  <Button type="submit" variant="primary" className={`w-full ${selectedAcc.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700 text-white border-none shadow-none' : ''}`}>
                    {selectedAcc.status === 'ACTIVE' ? (
                      <><ShieldBan className="w-4 h-4 mr-2" /> Freeze Account</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4 mr-2" /> Unfreeze Account</>
                    )}
                  </Button>
                </form>
                <form action={onToggleStatus}>
                  <input type="hidden" name="id" value={selectedAcc.id} />
                  <input type="hidden" name="status" value="CLOSED" />
                  <Button type="submit" variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" disabled={selectedAcc.status === 'CLOSED'}>
                    Close Account
                  </Button>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
