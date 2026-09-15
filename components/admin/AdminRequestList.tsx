"use client";

import { useState } from "react";
import { format } from "date-fns";
import { KeyRound, Search, Filter, Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
  rejectionReason: string | null;
  temporaryPassword?: string | null;
  isFirstLogin?: boolean;
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
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

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
                      onClick={() => {
                        setSelectedReq(req);
                        setIsRejecting(false);
                        setRejectionReason("");
                      }}
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
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Status</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      selectedReq.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      selectedReq.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedReq.status}
                    </span>
                  </div>

                  {selectedReq.status === 'APPROVED' && selectedReq.isFirstLogin && selectedReq.temporaryPassword && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Active Temporary Password
                      </p>
                      <p className="font-mono font-bold text-xl text-blue-900 tracking-wider bg-white px-3 py-2 rounded border border-blue-100 inline-block">
                        {selectedReq.temporaryPassword}
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        This password is valid until the customer completes their first-time login onboarding.
                      </p>
                    </div>
                  )}

                  {selectedReq.status === 'APPROVED' && !selectedReq.isFirstLogin && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-800 font-semibold mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Onboarding Complete
                      </p>
                      <p className="text-xs text-green-700">
                        The customer has successfully logged in and set their permanent credentials.
                      </p>
                    </div>
                  )}

                  {selectedReq.status === 'REJECTED' && selectedReq.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-800 font-semibold uppercase tracking-wider mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-900">{selectedReq.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedReq.status === 'PENDING' && !isRejecting && (
                <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200">
                  <form action={async (formData) => { await onApprove(formData); setSelectedReq(null); }} className="w-full">
                    <input type="hidden" name="id" value={selectedReq.id} />
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Generate OTP
                    </Button>
                  </form>
                  <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={() => setIsRejecting(true)}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject Request
                  </Button>
                </div>
              )}

              {selectedReq.status === 'PENDING' && isRejecting && (
                <form action={async (formData) => { await onReject(formData); setSelectedReq(null); }} className="space-y-3 pt-4 border-t border-neutral-200">
                  <input type="hidden" name="id" value={selectedReq.id} />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal">Reason for Rejection (sent to customer)</label>
                    <textarea 
                      name="rejectionReason"
                      required
                      className="w-full min-h-[80px] p-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Identity verification failed."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRejecting(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-none">
                      Confirm Rejection
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
