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
import { Plus, Trash2, Edit2, Play, RefreshCcw, Save, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { AdminUser } from "./AdminUserList";

export function AdminTxHistoryManager({ user, accountId: defaultAccountId }: { user: AdminUser, accountId: string }) {
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [showGenRandom, setShowGenRandom] = useState(false);
  const [randomCfg, setRandomCfg] = useState({
    count: 10, minAmount: 10, maxAmount: 500, creditMix: 30
  });

  const fetchTxs = async () => {
    if (!selectedAccountId) return;
    setLoading(true);
    try {
      const data = await adminGetCustomerTransactions(selectedAccountId);
      setTransactions(data);
    } catch (e) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, [selectedAccountId]);

  const handleCreate = async () => {
    try {
      await adminCreateTransaction({
        accountId: selectedAccountId,
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

  const startEdit = (tx: any) => {
    setEditingId(tx.id);
    // Properly format the datetime string for the input
    let dt = new Date(tx.createdAt);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    setEditForm({ ...tx, createdAt: dt.toISOString().slice(0, 16) });
  }

  const saveEdit = async () => {
    try {
      await adminUpdateTransaction(editingId!, {
        ...editForm,
        amount: parseFloat(editForm.amount),
        createdAt: new Date(editForm.createdAt).toISOString()
      });
      toast.success("Transaction updated");
      setEditingId(null);
      fetchTxs();
    } catch(e) {
      toast.error("Update failed");
    }
  }

  const handleGenerateRandom = async () => {
    if (!confirm(`Generate ${randomCfg.count} random transactions?`)) return;
    try {
      await adminGenerateRandomTransactions({
        accountId: selectedAccountId,
        count: randomCfg.count,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        minAmount: randomCfg.minAmount,
        maxAmount: randomCfg.maxAmount,
        typeMix: { credit: randomCfg.creditMix, debit: 100 - randomCfg.creditMix }
      });
      toast.success("Random transactions generated");
      setShowGenRandom(false);
      fetchTxs();
    } catch(e) {
      toast.error("Generation failed");
    }
  }

  const handleReset = async () => {
    if(!confirm("Delete all admin generated transactions?")) return;
    try {
      await adminResetTransactionHistory(selectedAccountId);
      toast.success("History reset");
      fetchTxs();
    } catch(e) {
      toast.error("Reset failed");
    }
  }

  return (
    <div className="space-y-4">
      {user.accounts.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-semibold">Select Account:</label>
          <select 
            className="border rounded p-1 text-sm"
            value={selectedAccountId} 
            onChange={e => setSelectedAccountId(e.target.value)}
          >
            {user.accounts.map((acc: any) => (
              <option key={acc.id} value={acc.id}>{acc.accountType} - {acc.accountNumber.slice(-4)}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2 mb-4 bg-slate-50 p-3 rounded border flex-wrap">
        <Button size="small" onClick={handleCreate}><Plus className="w-4 h-4 mr-1"/> Add Manual Entry</Button>
        <Button size="small" variant="outline" onClick={() => setShowGenRandom(!showGenRandom)}><Play className="w-4 h-4 mr-1"/> Gen Random</Button>
        <Button size="small" variant="outline" onClick={handleReset} className="text-red-600 ml-auto"><RefreshCcw className="w-4 h-4 mr-1"/> Reset Admin Gen</Button>
      </div>

      {showGenRandom && (
        <div className="bg-white border rounded p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-xs font-semibold">Count</label>
            <input type="number" className="w-full border rounded p-1 text-sm" value={randomCfg.count} onChange={e => setRandomCfg({...randomCfg, count: parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="text-xs font-semibold">Min Amount</label>
            <input type="number" className="w-full border rounded p-1 text-sm" value={randomCfg.minAmount} onChange={e => setRandomCfg({...randomCfg, minAmount: parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="text-xs font-semibold">Max Amount</label>
            <input type="number" className="w-full border rounded p-1 text-sm" value={randomCfg.maxAmount} onChange={e => setRandomCfg({...randomCfg, maxAmount: parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="text-xs font-semibold">% Credit</label>
            <input type="number" className="w-full border rounded p-1 text-sm" value={randomCfg.creditMix} onChange={e => setRandomCfg({...randomCfg, creditMix: parseInt(e.target.value)})} />
          </div>
          <div className="col-span-full">
            <Button size="small" onClick={handleGenerateRandom} className="w-full">Generate Now</Button>
          </div>
        </div>
      )}

      <div className="border rounded overflow-hidden overflow-x-auto">
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
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No transactions</TableCell></TableRow>
            ) : (
              transactions.map(tx => (
                <TableRow key={tx.id} className={tx.isAdminEntry ? 'bg-amber-50/30' : ''}>
                  {editingId === tx.id ? (
                    <>
                      <TableCell><input type="datetime-local" className="border rounded p-1 text-xs w-32" value={editForm.createdAt} onChange={e => setEditForm({...editForm, createdAt: e.target.value})} /></TableCell>
                      <TableCell>
                        <select className="border rounded p-1 text-xs" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                          <option value="CREDIT">CREDIT</option>
                          <option value="DEBIT">DEBIT</option>
                        </select>
                      </TableCell>
                      <TableCell><input type="text" className="border rounded p-1 text-xs w-full" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></TableCell>
                      <TableCell><input type="number" step="0.01" className="border rounded p-1 text-xs w-20" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} /></TableCell>
                      <TableCell className="font-mono text-muted-foreground">${(tx.runningBalance || 0).toFixed(2)}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button variant="ghost" size="small" className="h-6 px-2 text-green-600" onClick={saveEdit}><Save className="w-3 h-3"/></Button>
                        <Button variant="ghost" size="small" className="h-6 px-2 text-slate-500" onClick={() => setEditingId(null)}><X className="w-3 h-3"/></Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="whitespace-nowrap">{format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell>{tx.description} {tx.isAdminEntry && <span className="text-[10px] bg-amber-100 text-amber-800 px-1 ml-2 rounded">ADMIN</span>}</TableCell>
                      <TableCell className={tx.type === 'CREDIT' ? 'text-green-600 font-semibold' : 'text-slate-800 font-semibold'}>
                        ${tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">${(tx.runningBalance || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="small" className="h-6 w-6 p-0 text-blue-600" onClick={() => startEdit(tx)}><Edit2 className="w-3 h-3"/></Button>
                          <Button variant="ghost" size="small" className="h-6 w-6 p-0 text-red-600" onClick={() => handleDelete(tx.id)}><Trash2 className="w-3 h-3"/></Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
