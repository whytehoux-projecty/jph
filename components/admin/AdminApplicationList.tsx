"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Search, Filter, Eye, CheckCircle2, XCircle, CalendarClock, ExternalLink } from "lucide-react";
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

type AccountApplication = {
  id: string;
  applicationType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  nationality: string | null;
  currencyPreference: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  employmentStatus: string;
  annualIncome: number;
  idDocumentUrl: string | null;
  livenessImageUrl: string | null;
  verificationRequired: boolean;
  scheduledMeetingAt: Date | null;
  meetingMethod: string | null;
  registrationToken?: string | null;
  status: string;
  createdAt: Date;
  desiredAccountType: string | null;
  isExistingCustomer: boolean;
  isUsCitizenOrResident: boolean;
};

export function AdminApplicationList({ 
  initialApplications,
  onApprove,
  onReject,
  onRequestVerification
}: { 
  initialApplications: AccountApplication[];
  onApprove: (formData: FormData) => void;
  onReject: (formData: FormData) => void;
  onRequestVerification: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<AccountApplication | null>(null);
  const [initialDeposit, setInitialDeposit] = useState<string>("0");

  const filtered = initialApplications.filter((app) => {
    const matchesSearch = 
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    
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
            placeholder="Search email or applicant name..." 
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
              <TableHead>Applicant</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Verification</TableHead>
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
              filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium text-charcoal">{app.firstName} {app.lastName}</div>
                    <div className="text-sm text-muted-foreground">{app.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md font-medium uppercase tracking-wide">
                      {app.applicationType}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(app.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {app.scheduledMeetingAt ? (
                      <div className="text-xs flex items-center gap-1 text-blue-600 font-medium">
                        <CalendarClock className="w-3 h-3" /> {format(new Date(app.scheduledMeetingAt), 'MMM d, HH:mm')}
                      </div>
                    ) : app.verificationRequired ? (
                      <span className="text-xs text-amber-600">Pending Schedule</span>
                    ) : (
                      <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Documents OK</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      app.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      app.status === 'VERIFICATION_REQUIRED' ? 'bg-blue-100 text-blue-800' : 
                      app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    {app.status === 'APPROVED' && app.registrationToken && (
                        <div className="mt-1">
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded border border-gray-200">
                                /register/{app.registrationToken.substring(0, 8)}...
                            </span>
                        </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => setSelectedApp(app)}
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
      <Dialog open={!!selectedApp} onOpenChange={(open) => {
          if (!open) { setSelectedApp(null); setInitialDeposit("0"); }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <FileText className="w-5 h-5" /> Account Application Review
            </DialogTitle>
            <DialogDescription>
              Applicant: <span className="font-medium text-charcoal">{selectedApp?.firstName} {selectedApp?.lastName}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Preliminary Contact Info</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-medium">{selectedApp.firstName} {selectedApp.lastName}</span>
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{selectedApp.phone}</span>
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{selectedApp.email}</span>
                    <span className="text-muted-foreground">Zip Code</span>
                    <span className="font-medium">{selectedApp.zipCode}</span>
                  </div>
                </div>

                <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Eligibility Status</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-muted-foreground">Requested Product</span>
                    <span className="font-medium">{selectedApp.desiredAccountType || selectedApp.applicationType}</span>
                    <span className="text-muted-foreground">Existing Customer</span>
                    <span className="font-medium">{selectedApp.isExistingCustomer ? 'Yes' : 'No'}</span>
                    <span className="text-muted-foreground">US Citizen/Resident</span>
                    <span className="font-medium">{selectedApp.isUsCitizenOrResident ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Staff Verification Section (If Required) */}
              {selectedApp.verificationRequired && (
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 space-y-4">
                      <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                          <CalendarClock className="w-5 h-5"/> Staff Verification Requested
                      </h4>
                      {selectedApp.scheduledMeetingAt ? (
                          <div className="text-sm text-blue-800">
                              <p><strong>Scheduled Time:</strong> {format(new Date(selectedApp.scheduledMeetingAt), 'PPPP p')}</p>
                              <p><strong>Method:</strong> {selectedApp.meetingMethod}</p>
                          </div>
                      ) : (
                          <p className="text-sm text-blue-700">Waiting for customer to schedule a meeting slot via the portal.</p>
                      )}
                  </div>
              )}

              {selectedApp.status === 'APPROVED' && selectedApp.registrationToken && (
                  <div className="bg-green-50 p-5 rounded-lg border border-green-200 space-y-4">
                      <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5"/> Registration Link Generated
                      </h4>
                      <p className="text-sm text-green-800">
                          Application approved. Provide the applicant with the following secure link to complete their full registration.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-white px-3 py-2 rounded border border-green-200 flex-1 break-all select-all font-mono">
                              {typeof window !== 'undefined' ? window.location.origin : ''}/register/{selectedApp.registrationToken}
                          </code>
                      </div>
                  </div>
              )}

              {/* Action Buttons */}
              {(selectedApp.status === 'PENDING' || selectedApp.status === 'VERIFICATION_REQUIRED') && (
                <div className="space-y-4 pt-4 border-t border-neutral-200">                  <div className="flex items-center gap-3 justify-end">
                    <form action={async (formData) => { await onReject(formData); setSelectedApp(null); }}>
                      <input type="hidden" name="id" value={selectedApp.id} />
                      <Button type="submit" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-2" /> Reject (Decline)
                      </Button>
                    </form>

                    {!selectedApp.verificationRequired && (
                        <form action={async (formData) => { await onRequestVerification(formData); setSelectedApp(null); }}>
                        <input type="hidden" name="id" value={selectedApp.id} />
                        <Button type="submit" variant="primary" className="bg-amber-500 hover:bg-amber-600 border-none shadow-none text-white">
                            <CalendarClock className="w-4 h-4 mr-2" /> Request Meeting
                        </Button>
                        </form>
                    )}
                    
                    <form action={async (formData) => { 
                        formData.append('initialDeposit', initialDeposit);
                        await onApprove(formData); 
                        setSelectedApp(null); 
                    }}>
                      <input type="hidden" name="id" value={selectedApp.id} />
                      <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Provision
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
