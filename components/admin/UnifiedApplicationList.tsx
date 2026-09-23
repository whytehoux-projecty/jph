"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Search, Filter, ShieldCheck, FileSpreadsheet, Eye, CheckCircle2, XCircle, CalendarClock, Lock } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

export type UnifiedRequest = {
  id: string;
  type: 'ACCOUNT' | 'EPORTAL' | 'CHEQUE';
  applicantName: string;
  applicantEmail: string;
  date: Date;
  status: string;
  details: string;
  raw: any;
};

export function UnifiedApplicationList({ 
  requests,
  onAccountApprove,
  onAccountReject,
  onAccountVerify,
  onEportalApprove,
  onEportalReject,
  onChequeApprove,
  onChequeReject
}: { 
  requests: UnifiedRequest[];
  onAccountApprove: (formData: FormData) => void;
  onAccountReject: (formData: FormData) => void;
  onAccountVerify: (formData: FormData) => void;
  onEportalApprove: (formData: FormData) => void;
  onEportalReject: (formData: FormData) => void;
  onChequeApprove: (formData: FormData) => void;
  onChequeReject: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedReq, setSelectedReq] = useState<UnifiedRequest | null>(null);

  // For account approval initial deposit
  const [initialDeposit, setInitialDeposit] = useState<string>("0");

  const filtered = requests.filter((req) => {
    const matchesSearch = 
      req.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.applicantName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesType = typeFilter === "ALL" || req.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getRowColor = (type: string) => {
    switch(type) {
      case 'ACCOUNT': return 'bg-blue-50/30 hover:bg-blue-50/60';
      case 'EPORTAL': return 'bg-orange-50/30 hover:bg-orange-50/60';
      case 'CHEQUE': return 'bg-emerald-50/30 hover:bg-emerald-50/60';
      default: return '';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'ACCOUNT': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'EPORTAL': return <ShieldCheck className="w-4 h-4 text-orange-600" />;
      case 'CHEQUE': return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      default: return null;
    }
  };

  const getTypeName = (type: string) => {
    switch(type) {
      case 'ACCOUNT': return 'New Account';
      case 'EPORTAL': return 'e-Portal Access';
      case 'CHEQUE': return 'Cheque Book';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search email or name..." 
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            className="text-sm bg-neutral-50 border border-neutral-200 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="ACCOUNT">New Accounts</option>
            <option value="EPORTAL">e-Portal</option>
            <option value="CHEQUE">Cheques</option>
          </select>
          <select 
            className="text-sm bg-neutral-50 border border-neutral-200 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFICATION_REQUIRED">Requires Verification</option>
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
              <TableHead>Type</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No applications found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => (
                <TableRow key={req.id} className={getRowColor(req.type)}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {getIcon(req.type)}
                      {getTypeName(req.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-charcoal">{req.applicantName}</div>
                    <div className="text-sm text-muted-foreground">{req.applicantEmail}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {req.details}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(req.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                      req.status === 'VERIFICATION_REQUIRED' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
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
                      <Eye className="w-4 h-4 mr-1" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedReq} onOpenChange={(open) => {
          if (!open) {
            setSelectedReq(null);
            setInitialDeposit("0");
          }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              {selectedReq && getIcon(selectedReq.type)}
              Review {selectedReq && getTypeName(selectedReq.type)} Request
            </DialogTitle>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase font-semibold">Applicant</p>
                  <p className="font-medium text-charcoal">{selectedReq.applicantName}</p>
                  <p className="text-muted-foreground">{selectedReq.applicantEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase font-semibold">Status</p>
                  <p className="font-bold">{selectedReq.status}</p>
                  <p className="text-muted-foreground text-xs mt-1">Applied: {format(new Date(selectedReq.date), 'PPp')}</p>
                </div>
              </div>

              {/* Dynamic Content based on Type */}
              {selectedReq.type === 'ACCOUNT' && (
                <div className="space-y-4 text-sm">
                  <h4 className="font-bold text-charcoal border-b pb-2">Application Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground block text-xs">Desired Account</span> {selectedReq.raw.desiredAccountType}</div>
                    <div><span className="text-muted-foreground block text-xs">Currency</span> {selectedReq.raw.currencyPreference}</div>
                    <div><span className="text-muted-foreground block text-xs">Employment</span> {selectedReq.raw.employmentStatus}</div>
                    <div><span className="text-muted-foreground block text-xs">Stated Income</span> ${selectedReq.raw.annualIncome?.toLocaleString()}</div>
                    <div className="col-span-2"><span className="text-muted-foreground block text-xs">Address</span> {selectedReq.raw.address}, {selectedReq.raw.city}, {selectedReq.raw.state} {selectedReq.raw.zipCode}</div>
                  </div>
                  
                  {selectedReq.status === 'PENDING' || selectedReq.status === 'VERIFICATION_REQUIRED' ? (
                    <div className="pt-6 mt-6 border-t border-neutral-200">
                      <h4 className="font-bold text-charcoal mb-4">Decision Actions</h4>
                      
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                        <label className="block text-sm font-semibold text-blue-900 mb-2">Initial Deposit Amount ($)</label>
                        <p className="text-xs text-blue-700 mb-3">If approving, specify the initial starting balance for the new account.</p>
                        <input 
                          type="number" 
                          value={initialDeposit} 
                          onChange={(e) => setInitialDeposit(e.target.value)} 
                          className="w-full max-w-xs px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <form action={onAccountApprove}>
                          <input type="hidden" name="id" value={selectedReq.id} />
                          <input type="hidden" name="initialDeposit" value={initialDeposit} />
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Provision
                          </Button>
                        </form>
                        
                        {selectedReq.status === 'PENDING' && (
                          <form action={onAccountVerify}>
                            <input type="hidden" name="id" value={selectedReq.id} />
                            <Button type="submit" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                              <CalendarClock className="w-4 h-4 mr-2" /> Require Meeting
                            </Button>
                          </form>
                        )}
                        
                        <form action={onAccountReject}>
                          <input type="hidden" name="id" value={selectedReq.id} />
                          <Button type="submit" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-100 rounded text-center text-sm text-muted-foreground">
                      This application has already been {selectedReq.status.toLowerCase()}.
                    </div>
                  )}
                </div>
              )}

              {selectedReq.type === 'EPORTAL' && (
                <div className="space-y-4 text-sm">
                  <h4 className="font-bold text-charcoal border-b pb-2">Request Details</h4>
                  <p>Customer is requesting activation of their internet banking profile for e-Portal access.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground block text-xs">Associated Account Number</span> {selectedReq.raw.accountNumber}</div>
                  </div>

                  {selectedReq.status === 'PENDING' && (
                    <div className="pt-6 mt-6 border-t border-neutral-200 flex gap-3">
                      <form action={onEportalApprove}>
                        <input type="hidden" name="id" value={selectedReq.id} />
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Access
                        </Button>
                      </form>
                      <form action={onEportalReject}>
                        <input type="hidden" name="id" value={selectedReq.id} />
                        <Button type="submit" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {selectedReq.type === 'CHEQUE' && (
                <div className="space-y-4 text-sm">
                  <h4 className="font-bold text-charcoal border-b pb-2">Request Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground block text-xs">Target Account Number</span> {selectedReq.raw.account?.accountNumber || 'Unknown'}</div>
                    <div><span className="text-muted-foreground block text-xs">Number of Leaves</span> {selectedReq.raw.numberOfLeaves}</div>
                    <div><span className="text-muted-foreground block text-xs">Delivery Method</span> {selectedReq.raw.deliveryMethod}</div>
                  </div>

                  {selectedReq.status === 'PENDING' && (
                    <div className="pt-6 mt-6 border-t border-neutral-200 flex gap-3">
                      <form action={onChequeApprove}>
                        <input type="hidden" name="id" value={selectedReq.id} />
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Request
                        </Button>
                      </form>
                      <form action={onChequeReject}>
                        <input type="hidden" name="id" value={selectedReq.id} />
                        <Button type="submit" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
