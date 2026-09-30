"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  adminGetCustomerTransactions, 
  adminCreateTransaction, 
  adminUpdateTransaction, 
  adminDeleteTransaction,
  adminGenerateRandomTransactions,
  adminGenerateTargetedTransactions,
  adminResetTransactionHistory
} from "@/app/actions/admin-transactions";
import { Plus, Trash2, Edit2, Play, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminUser } from "./AdminUserList";

export function AdminTxHistoryManager({ user, accountId }: { user: AdminUser, accountId: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTxs = async () => {
    setLoading(true);
    try {
      const data = await adminGetCustomerTransactions(accountId);
      setTransactions(data);
    } catch (e) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) fetchTxs();
  }, [accountId]);

  const handleCreate = async () => {
    try {
      await adminCreateTransaction({
        accountId,
        type: "CREDIT",
        transactionType: "LOCAL_TRANSFER",
        amount: 50,
        status: "COMPLETED",
        description: "Admin Deposit",
        category: "Income",
        createdAt: new Date().toISOString()
      });
      toast.success("Transaction created");
      fetchTxs();
    } catch(e) {
      toast.error("Creation failed");
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await adminDeleteTransaction(id);
      toast.success("Transaction deleted");
      fetchTxs();
    } catch(e) {
      toast.error("Delete failed");
    }
  }

  const handleGenerateRandom = async () => {
    try {
      await adminGenerateRandomTransactions({
        accountId,
        count: 10,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        minAmount: 10,
        maxAmount: 500,
        typeMix: { credit: 30, debit: 70 }
      });
      toast.success("Random transactions generated");
      fetchTxs();
    } catch(e) {
      toast.error("Generation failed");
    }
  }

  const handleGenerateTargeted = async () => {
    try {
      await adminGenerateTargetedTransactions({
        accountId,
        targetBalance: 5000,
        targetCount: 15,
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      toast.success("Targeted transactions generated");
      fetchTxs();
    } catch(e) {
      toast.error("Generation failed");
    }
  }

  const handleReset = async () => {
    if(!confirm("Delete all admin generated transactions?")) return;
    try {
      await adminResetTransactionHistory(accountId);
      toast.success("History reset");
      fetchTxs();
    } catch(e) {
      toast.error("Reset failed");
    }
  }

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4 bg-slate-50 p-3 rounded border">
        <Button size="small" onClick={handleCreate}><Plus className="w-4 h-4 mr-1"/> Add Manual Entry</Button>
        <Button size="small" variant="outline" onClick={handleGenerateRandom}><Play className="w-4 h-4 mr-1"/> Gen Random (10)</Button>
        <Button size="small" variant="outline" onClick={handleGenerateTargeted}><Play className="w-4 h-4 mr-1"/> Gen Targeted ($5000)</Button>
        <Button size="small" variant="outline" onClick={handleReset} className="text-red-600"><RefreshCcw className="w-4 h-4 mr-1"/> Reset Admin Gen</Button>
      </div>

      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Desc</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Running Bal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No transactions</TableCell></TableRow>
            ) : (
              transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{format(new Date(tx.createdAt), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-800'}>
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono">${(tx.runningBalance || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="small" className="h-6 px-2 text-red-600" onClick={() => handleDelete(tx.id)}><Trash2 className="w-3 h-3"/></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
