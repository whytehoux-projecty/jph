"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Search, PlusCircle, FileCheck } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";

type AdminStatement = {
  id: string;
  period: string;
  generatedAt: Date;
  account: {
    accountNumber: string;
    accountType: string;
    user: {
      firstName: string;
      lastName: string;
    }
  };
};

type AccountOption = {
  id: string;
  accountNumber: string;
  accountType: string;
  user: {
    firstName: string;
    lastName: string;
  }
};

export function AdminStatementList({ 
  initialStatements,
  accounts,
  onGenerate
}: { 
  initialStatements: AdminStatement[];
  accounts: AccountOption[];
  onGenerate: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));

  const filtered = initialStatements.filter((stmt) => {
    return stmt.account.accountNumber.includes(searchTerm) ||
           stmt.account.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           stmt.period.includes(searchTerm);
  });

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onGenerate(formData);
  };

  return (
    <div className="space-y-6">
      
      {/* Generate Statement */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-4">
          <PlusCircle className="w-5 h-5 text-vintage-gold" />
          <h3 className="font-playfair text-lg font-bold text-charcoal">Generate New Statement</h3>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Account</label>
            <select 
              name="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} - {acc.user.firstName} {acc.user.lastName} ({acc.accountType})
                </option>
              ))}
            </select>
          </div>
          <div className="w-48 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Period</label>
            <input 
              type="month" 
              name="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
            />
          </div>
          <Button type="submit" className="bg-charcoal text-white hover:bg-neutral-800 h-[38px]">
            Generate PDF
          </Button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
          <h3 className="font-semibold text-charcoal">Generated Statements</h3>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search account or period..." 
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Statement Period</TableHead>
              <TableHead>Generated At</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No statements found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((stmt) => (
                <TableRow key={stmt.id}>
                  <TableCell className="font-mono font-medium text-charcoal">
                    {stmt.account.accountNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal">{stmt.account.user.firstName} {stmt.account.user.lastName}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">{stmt.period}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(stmt.generatedAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      <FileCheck className="w-3 h-3" /> Ready
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
