"use client";

import { useState } from "react";
import { format } from "date-fns";
import { KeyRound, Search, Filter, Eye, CheckCircle2, XCircle } from "lucide-react";
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

type OnlineAccessRequest = {
  id: string;
  accountNumber: string;
  email: string;
  status: string;
  createdAt: Date;
};

export function AdminRequestList({ 
  initialRequests,
  onApprove,
  onReject
}: { 
  initialRequests: OnlineAccessRequest[];
  onApprove: (formData: FormData) => void;
  onReject: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReq, setSelectedReq] = useState<OnlineAccessRequest | null>(null);

  const filtered = initialRequests.filter((req) => {
    const matchesSearch = 
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.accountNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    
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
            placeholder="Search email or account number..." 
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
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No requests found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono font-medium text-charcoal">
                    {req.accountNumber}
                  </TableCell>
                  <TableCell className="text-sm">
                    {req.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(req.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {req.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => setSelectedReq(req)}
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
      <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> Online Access Request
            </DialogTitle>
            <DialogDescription>
              Review the credentials for internet banking access.
            </DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-6 py-4">
              <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 space-y-4">
                <div className="grid grid-cols-1 gap-y-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Account Number</p>
                    <p className="font-mono font-medium text-lg text-charcoal">{selectedReq.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-medium text-charcoal">{selectedReq.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Requested On</p>
                    <p className="font-medium text-charcoal">{format(new Date(selectedReq.createdAt), 'PPP p')}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedReq.status === 'PENDING' && (
                <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200">
                  <form action={onApprove} className="w-full">
                    <input type="hidden" name="id" value={selectedReq.id} />
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelectedReq(null)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Online Access
                    </Button>
                  </form>
                  <form action={onReject} className="w-full">
                    <input type="hidden" name="id" value={selectedReq.id} />
                    <Button type="submit" variant="primary" className="w-full bg-red-600 hover:bg-red-700 text-white border-none shadow-none" onClick={() => setSelectedReq(null)}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject Request
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
