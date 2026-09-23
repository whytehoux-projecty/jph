"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Users, Search, Filter, ShieldAlert, ShieldCheck, UserCheck, UserX, Crown, User as UserIcon, Building2, CreditCard, FileText, Settings, Key, Trash2, LogIn, Download, Mail } from "lucide-react";
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
import { resetUserPassword, toggleUserOnlineAccess, sendStatementEmail } from "@/app/actions/admin";

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  tier: string;
  hasOnlineAccess: boolean;
  createdAt: Date;
  isFirstLogin?: boolean;
  temporaryPassword?: string | null;
  accounts: {
    id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    status: string;
  }[];
  cards: {
    id: string;
    cardNumber: string;
    cardType: string;
    network: string;
    status: string;
    expiryDate: Date;
  }[];
  statements: {
    id: string;
    period: string;
    generatedAt: Date;
    accountId: string;
  }[];
  registrationForm?: {
    // Bio
    fullLegalName: string;
    dateOfBirth: Date;
    ssnItin: string;
    mothersMaidenName: string;
    residentialAddress: string;
    mailingAddress: string;
    primaryPhoneType: string;
    // Employment & Finance
    employmentStatus: string;
    occupation: string;
    employerName: string;
    primarySourceOfFunds: string;
    estimatedAnnualIncome: string;
    // Identity
    primaryIdType: string;
    idNumber: string;
    stateCountryOfIssuance: string;
    issueDate: Date;
    expirationDate: Date;
    idFrontDocumentUrl: string | null;
    idBackDocumentUrl: string | null;
    passportPhotoUrl: string | null;
  } | null;
};

export function AdminUserList({ 
  initialUsers,
  onToggleStatus,
  onToggleTier,
  onDeletePin,
  onLoginAs,
  onToggleOnlineAccess
}: { 
  initialUsers: AdminUser[];
  onToggleStatus: (formData: FormData) => void;
  onToggleTier: (formData: FormData) => void;
  onDeletePin: (formData: FormData) => void;
  onLoginAs: (formData: FormData) => void;
  onToggleOnlineAccess?: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'bio' | 'accounts' | 'employment' | 'kyc' | 'eportal' | 'actions'>('bio');

  const filtered = initialUsers.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
    
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
            placeholder="Search by name or email..." 
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
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Online Access</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No customers found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium text-charcoal">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${
                      user.tier === 'PREMIUM' ? 'text-vintage-gold' : 'text-slate-500'
                    }`}>
                      {user.tier === 'PREMIUM' ? <Crown className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.tier}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.hasOnlineAccess ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><ShieldCheck className="w-3 h-3" /> Enabled</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-600"><ShieldAlert className="w-3 h-3" /> Disabled</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => setSelectedUser(user)}
                      className="text-vintage-gold hover:text-vintage-gold hover:bg-vintage-gold/10"
                    >
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
      <Dialog open={!!selectedUser} onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
          setActiveTab('bio');
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <Users className="w-5 h-5" /> Account Holder Panel
            </DialogTitle>
            <DialogDescription>
              View and manage customer profile and access.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-charcoal">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUser.phone || 'No phone provided'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider mb-2 ${
                      selectedUser.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.status}
                    </span>
                    <p className="text-xs text-muted-foreground">Joined: {format(new Date(selectedUser.createdAt), 'PP')}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap border-b border-neutral-200 gap-1">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'bio' ? 'text-vintage-gold border-b-2 border-vintage-gold' : 'text-neutral-500 hover:text-neutral-700'}`}
                  onClick={() => setActiveTab('bio')}
                >
                  <UserIcon className="w-4 h-4 inline-block mr-1" /> Customer Bio
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'accounts' ? 'text-vintage-gold border-b-2 border-vintage-gold' : 'text-neutral-500 hover:text-neutral-700'}`}
                  onClick={() => setActiveTab('accounts')}
                >
                  <Building2 className="w-4 h-4 inline-block mr-1" /> Account Info
                </button>
                {selectedUser.registrationForm && (
                  <>
                    <button
                      className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'employment' ? 'text-vintage-gold border-b-2 border-vintage-gold' : 'text-neutral-500 hover:text-neutral-700'}`}
                      onClick={() => setActiveTab('employment')}
                    >
                      Employment & Finance
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'kyc' ? 'text-vintage-gold border-b-2 border-vintage-gold' : 'text-neutral-500 hover:text-neutral-700'}`}
                      onClick={() => setActiveTab('kyc')}
                    >
                      Identity & KYC
                    </button>
                  </>
                )}
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'eportal' ? 'text-vintage-gold border-b-2 border-vintage-gold' : 'text-neutral-500 hover:text-neutral-700'}`}
                  onClick={() => setActiveTab('eportal')}
                >
                  <ShieldCheck className="w-4 h-4 inline-block mr-1" /> e-Portal
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'actions' ? 'text-vintage-gold border-b-2 border-vintage-gold' : 'text-neutral-500 hover:text-neutral-700'}`}
                  onClick={() => setActiveTab('actions')}
                >
                  <Settings className="w-4 h-4 inline-block mr-1" /> Admin Actions
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {activeTab === 'bio' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {selectedUser.registrationForm ? (
                      <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Personal Identification</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                          <div><span className="text-muted-foreground block text-xs">Full Legal Name</span> {selectedUser.registrationForm.fullLegalName}</div>
                          <div><span className="text-muted-foreground block text-xs">Date of Birth</span> {format(new Date(selectedUser.registrationForm.dateOfBirth), 'PPP')}</div>
                          <div><span className="text-muted-foreground block text-xs">SSN / ITIN</span> •••-••-{selectedUser.registrationForm.ssnItin.slice(-4)}</div>
                          <div><span className="text-muted-foreground block text-xs">Mother's Maiden Name</span> {selectedUser.registrationForm.mothersMaidenName}</div>
                          <div><span className="text-muted-foreground block text-xs">Residential Address</span> {selectedUser.registrationForm.residentialAddress}</div>
                          <div><span className="text-muted-foreground block text-xs">Mailing Address</span> {selectedUser.registrationForm.mailingAddress}</div>
                          <div><span className="text-muted-foreground block text-xs">Primary Phone Type</span> {selectedUser.registrationForm.primaryPhoneType}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-6 rounded-xl border border-neutral-200">
                         <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Basic Information</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div><span className="text-muted-foreground block text-xs">Email</span> {selectedUser.email}</div>
                            <div><span className="text-muted-foreground block text-xs">Phone</span> {selectedUser.phone || 'N/A'}</div>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'accounts' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Building2 className="w-4 h-4"/> Bank Accounts</h4>
                      {selectedUser.accounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 bg-neutral-50 rounded-lg border border-neutral-100">No bank accounts opened yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedUser.accounts.map(acc => (
                            <div key={acc.id} className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm flex justify-between items-center">
                              <div>
                                <p className="text-xs font-semibold text-charcoal uppercase">{acc.accountType}</p>
                                <p className="text-sm font-mono text-muted-foreground mt-1">{acc.accountNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-lg">${acc.balance.toFixed(2)}</p>
                                <span className="text-[10px] text-green-600 font-bold uppercase">{acc.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Issued Cards</h4>
                      {(!selectedUser.cards || selectedUser.cards.length === 0) ? (
                        <p className="text-sm text-muted-foreground p-4 bg-neutral-50 rounded-lg border border-neutral-100">No cards issued to this customer.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedUser.cards.map(card => (
                            <div key={card.id} className="p-4 bg-charcoal text-white rounded-xl shadow-sm relative overflow-hidden">
                              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                              <div className="flex justify-between items-start mb-4 relative z-10">
                                <p className="text-xs font-semibold uppercase tracking-wider">{card.cardType} CARD</p>
                                <span className="text-xs font-bold uppercase px-2 py-0.5 bg-white/10 rounded-full">{card.status}</span>
                              </div>
                              <p className="font-mono text-lg tracking-widest mb-2 relative z-10">•••• •••• •••• {card.cardNumber.slice(-4)}</p>
                              <div className="flex justify-between items-end relative z-10">
                                <p className="text-xs text-gray-400">Valid Thru: <span className="text-white">{format(new Date(card.expiryDate), 'MM/yy')}</span></p>
                                <p className="text-xs font-bold italic">{card.network}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Statements</h4>
                      {(!selectedUser.statements || selectedUser.statements.length === 0) ? (
                        <p className="text-sm text-muted-foreground p-4 bg-neutral-50 rounded-lg border border-neutral-100">No statements available.</p>
                      ) : (
                        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Generated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedUser.statements.map(stmt => (
                                <TableRow key={stmt.id}>
                                  <TableCell className="font-medium">{stmt.period}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{format(new Date(stmt.generatedAt), 'PP')}</TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="small" 
                                      className="text-vintage-gold h-8"
                                      onClick={() => {
                                        const acc = selectedUser.accounts.find(a => a.id === stmt.accountId);
                                        const content = `JP HERITAGE BANK - OFFICIAL ACCOUNT STATEMENT\n` +
                                          `Statement Period: ${stmt.period}\n` +
                                          `Account Number: ${acc?.accountNumber || 'Primary Account'}\n` +
                                          `Customer Name: ${selectedUser.firstName} ${selectedUser.lastName}\n` +
                                          `Email: ${selectedUser.email}\n` +
                                          `Date Issued: ${format(new Date(stmt.generatedAt), 'PPpp')}\n` +
                                          `Current Balance: $${acc?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}\n` +
                                          `Status: Verified / Official Copy\n\n` +
                                          `For questions regarding this statement, please contact JP Heritage Bank Support.`;
                                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `statement_${stmt.period}_${selectedUser.lastName.toLowerCase()}.txt`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                      }}
                                    >
                                      <Download className="w-3 h-3 mr-1" /> Download
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="small" 
                                      className="text-charcoal h-8"
                                      onClick={async () => {
                                        try {
                                          const fd = new FormData();
                                          fd.append('statementId', stmt.id);
                                          fd.append('email', selectedUser.email);
                                          await sendStatementEmail(fd);
                                          alert(`Account statement for period ${stmt.period} has been sent to ${selectedUser.email}`);
                                        } catch (err: any) {
                                          alert(err.message || 'Failed to dispatch statement email');
                                        }
                                      }}
                                    >
                                      <Mail className="w-3 h-3 mr-1" /> Email
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'employment' && selectedUser.registrationForm && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Employment Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div><span className="text-muted-foreground block text-xs">Employment Status</span> {selectedUser.registrationForm.employmentStatus}</div>
                        <div><span className="text-muted-foreground block text-xs">Occupation</span> {selectedUser.registrationForm.occupation}</div>
                        <div className="sm:col-span-2"><span className="text-muted-foreground block text-xs">Employer Name</span> {selectedUser.registrationForm.employerName}</div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Financial Profile</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div><span className="text-muted-foreground block text-xs">Primary Source of Funds</span> {selectedUser.registrationForm.primarySourceOfFunds}</div>
                        <div><span className="text-muted-foreground block text-xs">Estimated Annual Income</span> {selectedUser.registrationForm.estimatedAnnualIncome}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'kyc' && selectedUser.registrationForm && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Identity Document Info</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                        <div><span className="text-muted-foreground block text-xs">ID Type</span> {selectedUser.registrationForm.primaryIdType}</div>
                        <div><span className="text-muted-foreground block text-xs">ID Number</span> {selectedUser.registrationForm.idNumber}</div>
                        <div><span className="text-muted-foreground block text-xs">Issuing Authority</span> {selectedUser.registrationForm.stateCountryOfIssuance}</div>
                        <div><span className="text-muted-foreground block text-xs">Issue Date</span> {format(new Date(selectedUser.registrationForm.issueDate), 'PP')}</div>
                        <div><span className="text-muted-foreground block text-xs">Expiration Date</span> {format(new Date(selectedUser.registrationForm.expirationDate), 'PP')}</div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Uploaded Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Passport Photo */}
                        <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-50 flex flex-col">
                          <p className="text-xs font-semibold text-center mb-2 text-charcoal">Passport Photo</p>
                          <div className="flex-1 flex items-center justify-center min-h-[150px] bg-white rounded border border-neutral-100 overflow-hidden relative">
                            {selectedUser.registrationForm.passportPhotoUrl ? (
                              <img src={selectedUser.registrationForm.passportPhotoUrl} alt="Passport Photo" className="object-cover max-h-[200px]" />
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not provided</span>
                            )}
                          </div>
                        </div>

                        {/* ID Front */}
                        <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-50 flex flex-col">
                          <p className="text-xs font-semibold text-center mb-2 text-charcoal">ID Front</p>
                          <div className="flex-1 flex items-center justify-center min-h-[150px] bg-white rounded border border-neutral-100 overflow-hidden relative">
                            {selectedUser.registrationForm.idFrontDocumentUrl ? (
                              selectedUser.registrationForm.idFrontDocumentUrl.startsWith('data:image') || selectedUser.registrationForm.idFrontDocumentUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                <img src={selectedUser.registrationForm.idFrontDocumentUrl} alt="ID Front" className="object-contain w-full h-full" />
                              ) : (
                                <a href={selectedUser.registrationForm.idFrontDocumentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex flex-col items-center gap-2"><FileText className="w-8 h-8"/>View PDF Document</a>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not provided</span>
                            )}
                          </div>
                        </div>

                        {/* ID Back */}
                        <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-50 flex flex-col">
                          <p className="text-xs font-semibold text-center mb-2 text-charcoal">ID Back</p>
                          <div className="flex-1 flex items-center justify-center min-h-[150px] bg-white rounded border border-neutral-100 overflow-hidden relative">
                            {selectedUser.registrationForm.idBackDocumentUrl ? (
                              selectedUser.registrationForm.idBackDocumentUrl.startsWith('data:image') || selectedUser.registrationForm.idBackDocumentUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                <img src={selectedUser.registrationForm.idBackDocumentUrl} alt="ID Back" className="object-contain w-full h-full" />
                              ) : (
                                <a href={selectedUser.registrationForm.idBackDocumentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex flex-col items-center gap-2"><FileText className="w-8 h-8"/>View PDF Document</a>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not provided</span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'eportal' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-bold text-charcoal flex items-center gap-2">
                            Internet Banking Status
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">Controls the customer's authorization to access the online e-portal.</p>
                        </div>
                        <div>
                          {selectedUser.hasOnlineAccess ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                              <ShieldCheck className="w-4 h-4" /> Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                              <ShieldAlert className="w-4 h-4" /> Disabled
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm">
                          <p className="font-medium text-charcoal">
                            {selectedUser.hasOnlineAccess ? 'Active Online Banking Privileges' : 'Online Banking Suspended / Deactivated'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedUser.hasOnlineAccess 
                              ? 'Customer is currently authorized to log into the online banking interface.' 
                              : 'Customer cannot log into online banking until granted access.'}
                          </p>
                        </div>
                        <form action={async (formData: FormData) => {
                          const action = onToggleOnlineAccess || toggleUserOnlineAccess;
                          await action(formData);
                          setSelectedUser(prev => prev ? ({ ...prev, hasOnlineAccess: !prev.hasOnlineAccess }) : null);
                        }}>
                          <input type="hidden" name="id" value={selectedUser.id} />
                          <input type="hidden" name="hasOnlineAccess" value={(!selectedUser.hasOnlineAccess).toString()} />
                          <Button 
                            type="submit" 
                            variant={selectedUser.hasOnlineAccess ? "outline" : "primary"}
                            size="small"
                            className={selectedUser.hasOnlineAccess ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                          >
                            {selectedUser.hasOnlineAccess ? (
                              <><ShieldAlert className="w-4 h-4 mr-1.5" /> Revoke Portal Access</>
                            ) : (
                              <><ShieldCheck className="w-4 h-4 mr-1.5" /> Enable Portal Access</>
                            )}
                          </Button>
                        </form>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Access Credentials</h4>
                      {selectedUser.isFirstLogin && selectedUser.temporaryPassword ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                          <p className="font-semibold mb-1 flex items-center gap-2"><Key className="w-4 h-4"/> Pending First Login</p>
                          <p className="text-sm mb-3">The customer has not logged in yet. Their temporary password is:</p>
                          <code className="px-3 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-lg">{selectedUser.temporaryPassword}</code>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Customer has completed setup and is using their own private password.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Status Toggle */}
                      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
                        <h4 className="font-semibold text-charcoal mb-2">Account Status</h4>
                        <p className="text-sm text-muted-foreground mb-4">Suspend or activate the customer's entire profile.</p>
                        <form action={onToggleStatus}>
                          <input type="hidden" name="id" value={selectedUser.id} />
                          <input type="hidden" name="status" value={selectedUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'} />
                          <Button type="submit" variant="primary" className={`w-full ${selectedUser.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700 text-white border-none shadow-none' : ''}`}>
                            {selectedUser.status === 'ACTIVE' ? (
                              <><UserX className="w-4 h-4 mr-2" /> Suspend Customer</>
                            ) : (
                              <><UserCheck className="w-4 h-4 mr-2" /> Activate Customer</>
                            )}
                          </Button>
                        </form>
                      </div>

                      {/* Tier Toggle */}
                      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
                        <h4 className="font-semibold text-charcoal mb-2">Account Tier</h4>
                        <p className="text-sm text-muted-foreground mb-4">Upgrade or downgrade the customer's banking tier.</p>
                        <form action={onToggleTier}>
                          <input type="hidden" name="id" value={selectedUser.id} />
                          <input type="hidden" name="tier" value={selectedUser.tier === 'BASIC' ? 'PREMIUM' : 'BASIC'} />
                          <Button type="submit" variant="outline" className="w-full">
                            {selectedUser.tier === 'BASIC' ? (
                              <><Crown className="w-4 h-4 mr-2 text-vintage-gold" /> Upgrade to Premium</>
                            ) : (
                              <><UserIcon className="w-4 h-4 mr-2" /> Downgrade to Basic</>
                            )}
                          </Button>
                        </form>
                      </div>

                      {/* Online Access Toggle */}
                      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
                        <h4 className="font-semibold text-charcoal mb-2">e-Portal Banking</h4>
                        <p className="text-sm text-muted-foreground mb-4">Grant or revoke web and online banking access.</p>
                        <form action={async (formData: FormData) => {
                          const action = onToggleOnlineAccess || toggleUserOnlineAccess;
                          await action(formData);
                          setSelectedUser(prev => prev ? ({ ...prev, hasOnlineAccess: !prev.hasOnlineAccess }) : null);
                        }}>
                          <input type="hidden" name="id" value={selectedUser.id} />
                          <input type="hidden" name="hasOnlineAccess" value={(!selectedUser.hasOnlineAccess).toString()} />
                          <Button 
                            type="submit" 
                            variant={selectedUser.hasOnlineAccess ? "outline" : "primary"}
                            className={`w-full ${!selectedUser.hasOnlineAccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                          >
                            {selectedUser.hasOnlineAccess ? (
                              <><ShieldAlert className="w-4 h-4 mr-2" /> Revoke Portal Access</>
                            ) : (
                              <><ShieldCheck className="w-4 h-4 mr-2" /> Grant Portal Access</>
                            )}
                          </Button>
                        </form>
                      </div>

                      {/* Security Actions */}
                      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm md:col-span-3">
                        <h4 className="font-semibold text-charcoal mb-4">Security Actions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <form action={onLoginAs}>
                            <input type="hidden" name="id" value={selectedUser.id} />
                            <Button type="submit" variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                              <LogIn className="w-4 h-4 mr-2" /> Login As
                            </Button>
                          </form>
                          
                          <Button 
                            variant="outline" 
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to reset the password for ${selectedUser.firstName}?`)) {
                                try {
                                  const newPass = await resetUserPassword(selectedUser.id);
                                  alert(`Password reset successful!\n\nNew Password: ${newPass}\n\nPlease copy this and send it securely to the user.`);
                                } catch (e: any) {
                                  alert(e.message || "Failed to reset password");
                                }
                              }
                            }}
                          >
                            <Key className="w-4 h-4 mr-2" /> Reset Password
                          </Button>

                          <form action={onDeletePin} onSubmit={(e) => {
                            if (!confirm("Are you sure you want to delete this user's Transaction PIN? They will be forced to set up a new one on next login.")) {
                              e.preventDefault();
                            }
                          }}>
                            <input type="hidden" name="id" value={selectedUser.id} />
                            <Button type="submit" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete PIN
                            </Button>
                          </form>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
