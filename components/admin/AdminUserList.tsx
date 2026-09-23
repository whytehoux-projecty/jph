"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Users, Search, Filter, ShieldAlert, ShieldCheck, UserCheck, UserX, Crown, User as UserIcon, Building2, CreditCard, FileText, Settings, Key, Trash2, LogIn, Download, Mail, Plus, Edit2, Check, X, Building, Link2, CreditCard as CardIcon, FileSpreadsheet, Lock } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { sendStatementEmail } from "@/app/actions/admin";
import { toast } from "sonner";
import { 
  updateRegistrationForm, 
  createAccount, 
  updateAccount, 
  deleteAccount, 
  issueCard, 
  updateCard, 
  deleteCard, 
  issueCheque, 
  updateCheque, 
  deleteCheque, 
  generateStatement, 
  updateEportalStatus, 
  requestOnlineAccess,
  updateEportalCredentials
} from "@/app/actions/admin-customers";

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  tier: string;
  hasOnlineAccess: boolean;
  eportalStatus: string;
  eportalNotificationMessage: string | null;
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
  cheques: {
    id: string;
    chequeNumber: string;
    amount: number | null;
    payeeName: string | null;
    status: string;
    issueDate: Date;
  }[];
  statements: {
    id: string;
    period: string;
    generatedAt: Date;
    accountId: string;
  }[];
  registrationForm?: any | null;
};

export function AdminUserList({ 
  initialUsers,
  onLoginAs,
}: { 
  initialUsers: AdminUser[];
  onLoginAs: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'bio' | 'accounts' | 'employment' | 'kyc' | 'eportal'>('bio');
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  
  // Modals state for Account Info tab
  const [accountPanel, setAccountPanel] = useState<any>(null);
  const [cardPanel, setCardPanel] = useState<any>(null);
  const [chequePanel, setChequePanel] = useState<any>(null);

  const filtered = initialUsers.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditToggle = (tab: string) => {
    setEditMode(prev => ({ ...prev, [tab]: !prev[tab] }));
  };

  const handleSaveForm = async (e: React.FormEvent, tab: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append('userId', selectedUser!.id);
    await updateRegistrationForm(formData);
    setEditMode(prev => ({ ...prev, [tab]: false }));
    toast.success('Details updated successfully. Please refresh if changes do not appear immediately.');
  };

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
              <TableHead>e-Portal Access</TableHead>
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
                      <span className="flex items-center gap-1 text-xs text-red-600"><ShieldAlert className="w-3 h-3" /> {user.eportalStatus}</span>
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
      <Sheet open={!!selectedUser} onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
          setActiveTab('bio');
          setEditMode({});
      }}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-3xl overflow-y-auto p-0 gap-0 border-l border-[color:var(--heritage-navy)]/10">
          <SheetHeader className="p-6 bg-neutral-50 border-b border-neutral-200">
            <SheetTitle className="text-xl font-playfair flex items-center gap-2 text-[color:var(--heritage-navy)]">
              <Users className="w-5 h-5 text-[color:var(--heritage-gold)]" /> Account Holder Profile
            </SheetTitle>
            <SheetDescription>
              View and manage customer profile and access privileges.
            </SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-charcoal">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUser.phone || 'No phone provided'}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider ${
                      selectedUser.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.status}
                    </span>
                    <form action={onLoginAs}>
                      <input type="hidden" name="id" value={selectedUser.id} />
                      <Button type="submit" variant="outline" size="small" className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-7 px-3">
                        <LogIn className="w-3 h-3 mr-1" /> Login As
                      </Button>
                    </form>
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
                  <Building2 className="w-4 h-4 inline-block mr-1" /> Accounts
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
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                
                {/* BIO TAB */}
                {activeTab === 'bio' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-playfair font-bold text-[color:var(--heritage-navy)]">Personal Profile</h4>
                      <Button variant="ghost" size="small" onClick={() => handleEditToggle('bio')} className="text-[color:var(--heritage-navy)] hover:bg-[color:var(--heritage-navy)]/10">
                        {editMode.bio ? <><X className="w-4 h-4 mr-1"/> Cancel</> : <><Edit2 className="w-4 h-4 mr-1"/> Edit Info</>}
                      </Button>
                    </div>

                    {selectedUser.registrationForm ? (
                      <form onSubmit={(e) => handleSaveForm(e, 'bio')} className="relative space-y-6">
                        {editMode.bio && (
                          <div className="sticky top-0 z-10 flex justify-end mb-4 bg-white/80 backdrop-blur-sm py-2">
                            <Button type="submit" variant="primary" size="small" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                              <Check className="w-4 h-4 mr-1"/> Save Changes
                            </Button>
                          </div>
                        )}

                        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-[color:var(--heritage-gold)] mb-4 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Identity Details</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                              ['title', 'Title', selectedUser.registrationForm.title],
                              ['fullLegalName', 'Full Legal Name', selectedUser.registrationForm.fullLegalName],
                              ['gender', 'Gender', selectedUser.registrationForm.gender],
                              ['dateOfBirth', 'Date of Birth', selectedUser.registrationForm.dateOfBirth ? format(new Date(selectedUser.registrationForm.dateOfBirth), 'yyyy-MM-dd') : ''],
                              ['maritalStatus', 'Marital Status', selectedUser.registrationForm.maritalStatus],
                              ['nationality', 'Nationality', selectedUser.registrationForm.nationality],
                              ['ssnItin', 'SSN / ITIN', selectedUser.registrationForm.ssnItin],
                              ['mothersMaidenName', 'Mother\'s Maiden Name', selectedUser.registrationForm.mothersMaidenName],
                            ].map(([key, label, value]) => (
                              <div key={key}>
                                <label className="text-muted-foreground block text-[10px] mb-1 uppercase font-semibold">{label}</label>
                                {editMode.bio ? (
                                  <input type="text" name={key} defaultValue={value} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-[color:var(--heritage-gold)] focus:ring-1 focus:ring-[color:var(--heritage-gold)] outline-none bg-neutral-50" />
                                ) : (
                                  <div className="font-medium text-charcoal">{key === 'ssnItin' ? `•••-••-${value?.toString().slice(-4)}` : (value || 'N/A')}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-[color:var(--heritage-gold)] mb-4 flex items-center gap-2"><Mail className="w-4 h-4"/> Contact Information</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              ['primaryPhoneType', 'Primary Phone Type', selectedUser.registrationForm.primaryPhoneType],
                              ['secondaryPhone', 'Secondary Phone', selectedUser.registrationForm.secondaryPhone],
                              ['residentialAddress', 'Residential Address', selectedUser.registrationForm.residentialAddress],
                              ['mailingAddress', 'Mailing Address', selectedUser.registrationForm.mailingAddress],
                            ].map(([key, label, value]) => (
                              <div key={key} className={key.includes('Address') ? "sm:col-span-2" : ""}>
                                <label className="text-muted-foreground block text-[10px] mb-1 uppercase font-semibold">{label}</label>
                                {editMode.bio ? (
                                  <input type="text" name={key} defaultValue={value} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-[color:var(--heritage-gold)] focus:ring-1 focus:ring-[color:var(--heritage-gold)] outline-none bg-neutral-50" />
                                ) : (
                                  <div className="font-medium text-charcoal">{value || 'N/A'}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-[color:var(--heritage-gold)] mb-4 flex items-center gap-2"><Users className="w-4 h-4"/> Next of Kin</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              ['nextOfKinName', 'Full Name', selectedUser.registrationForm.nextOfKinName],
                              ['nextOfKinRelationship', 'Relationship', selectedUser.registrationForm.nextOfKinRelationship],
                              ['nextOfKinPhone', 'Phone Number', selectedUser.registrationForm.nextOfKinPhone],
                              ['nextOfKinAddress', 'Contact Address', selectedUser.registrationForm.nextOfKinAddress],
                            ].map(([key, label, value]) => (
                              <div key={key} className={key === 'nextOfKinAddress' ? "sm:col-span-2" : ""}>
                                <label className="text-muted-foreground block text-[10px] mb-1 uppercase font-semibold">{label}</label>
                                {editMode.bio ? (
                                  <input type="text" name={key} defaultValue={value} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-[color:var(--heritage-gold)] focus:ring-1 focus:ring-[color:var(--heritage-gold)] outline-none bg-neutral-50" />
                                ) : (
                                  <div className="font-medium text-charcoal">{value || 'N/A'}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-white p-12 rounded-2xl border border-neutral-100 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                          <UserX className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h4 className="text-lg font-playfair font-bold text-charcoal mb-2">No Profile Found</h4>
                        <p className="text-sm text-muted-foreground max-w-sm">This customer does not have a detailed registration form on file.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ACCOUNTS TAB */}
                {activeTab === 'accounts' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 p-6">
                    
                    {/* Bank Accounts */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-playfair font-bold text-[color:var(--heritage-navy)] flex items-center gap-2">Bank Accounts</h4>
                        <Button variant="outline" size="small" onClick={() => setAccountPanel('new')} className="h-8 text-xs border-[color:var(--heritage-gold)] text-[color:var(--heritage-gold)] hover:bg-[color:var(--heritage-gold)]/10"><Plus className="w-3 h-3 mr-1"/> Add Account</Button>
                      </div>
                      
                      {selectedUser.accounts.length === 0 ? (
                        <div className="bg-neutral-50 p-12 rounded-2xl border border-dashed border-neutral-300 flex flex-col items-center justify-center text-center">
                          <Building2 className="w-10 h-10 text-neutral-400 mb-3" />
                          <h4 className="text-sm font-bold text-charcoal mb-1">No Accounts Yet</h4>
                          <p className="text-xs text-muted-foreground mb-4">This customer hasn't opened any bank accounts.</p>
                          <Button onClick={() => setAccountPanel('new')} className="bg-[color:var(--heritage-navy)] hover:bg-[color:var(--heritage-navy)]/90 text-white h-8 text-xs"><Plus className="w-3 h-3 mr-1"/> Create First Account</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedUser.accounts.map(acc => {
                            const isSavings = acc.accountType.toLowerCase().includes('savings');
                            const isWealth = acc.accountType.toLowerCase().includes('wealth');
                            const bgClass = isWealth 
                              ? 'bg-gradient-to-br from-slate-900 to-black text-white border-slate-800' 
                              : isSavings 
                                ? 'bg-gradient-to-br from-[color:var(--heritage-navy)] to-slate-800 text-white border-[color:var(--heritage-navy)]' 
                                : 'bg-gradient-to-br from-white to-neutral-50 text-charcoal border-neutral-200';
                            
                            const textMuted = (isWealth || isSavings) ? 'text-white/60' : 'text-muted-foreground';
                            
                            return (
                              <div 
                                key={acc.id} 
                                onClick={() => setAccountPanel(acc)}
                                className={`p-5 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden group ${bgClass}`}
                              >
                                {(isWealth || isSavings) && (
                                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                                )}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                  <div>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${(isWealth || isSavings) ? 'text-[color:var(--heritage-gold)]' : 'text-[color:var(--heritage-navy)]'}`}>{acc.accountType}</p>
                                    <p className={`text-sm font-mono mt-1 ${textMuted}`}>{acc.accountNumber}</p>
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                                    acc.status === 'ACTIVE' 
                                      ? (isWealth || isSavings) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                      : (isWealth || isSavings) ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                                  }`}>{acc.status}</span>
                                </div>
                                <div className="text-right relative z-10">
                                  <p className="font-playfair font-bold text-2xl">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Issued Cards */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-playfair font-bold text-[color:var(--heritage-navy)] flex items-center gap-2">Issued Cards</h4>
                        <Button variant="outline" size="small" onClick={() => setCardPanel('new')} className="h-8 text-xs border-[color:var(--heritage-gold)] text-[color:var(--heritage-gold)] hover:bg-[color:var(--heritage-gold)]/10"><Plus className="w-3 h-3 mr-1"/> Add Card</Button>
                      </div>
                      
                      {(!selectedUser.cards || selectedUser.cards.length === 0) ? (
                        <div className="bg-neutral-50 p-12 rounded-2xl border border-dashed border-neutral-300 flex flex-col items-center justify-center text-center">
                          <CreditCard className="w-10 h-10 text-neutral-400 mb-3" />
                          <h4 className="text-sm font-bold text-charcoal mb-1">No Cards Issued</h4>
                          <p className="text-xs text-muted-foreground mb-4">This customer does not have any active debit or credit cards.</p>
                          <Button onClick={() => setCardPanel('new')} className="bg-[color:var(--heritage-navy)] hover:bg-[color:var(--heritage-navy)]/90 text-white h-8 text-xs"><Plus className="w-3 h-3 mr-1"/> Issue New Card</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedUser.cards.map(card => (
                            <div 
                              key={card.id} 
                              onClick={() => setCardPanel(card)}
                              className="p-4 bg-charcoal text-white rounded-xl shadow-sm relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-vintage-gold transition-all"
                            >
                              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                              <div className="flex justify-between items-start mb-4 relative z-10">
                                <p className="text-xs font-semibold uppercase tracking-wider">{card.cardType} CARD</p>
                                <span className="text-xs font-bold uppercase px-2 py-0.5 bg-white/10 rounded-full">{card.status}</span>
                              </div>
                              <p className="font-mono text-lg tracking-widest mb-2 relative z-10">•••• •••• •••• {card.cardNumber.slice(-4)}</p>
                              <div className="flex justify-between items-end relative z-10">
                                <p className="text-xs text-gray-400">Valid: <span className="text-white">{format(new Date(card.expiryDate), 'MM/yy')}</span></p>
                                <p className="text-xs font-bold italic">{card.network}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cheques */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-playfair font-bold text-[color:var(--heritage-navy)] flex items-center gap-2">Cheques</h4>
                        <Button variant="outline" size="small" onClick={() => setChequePanel('new')} className="h-8 text-xs border-[color:var(--heritage-gold)] text-[color:var(--heritage-gold)] hover:bg-[color:var(--heritage-gold)]/10"><Plus className="w-3 h-3 mr-1"/> Issue Cheque</Button>
                      </div>
                      
                      {(!selectedUser.cheques || selectedUser.cheques.length === 0) ? (
                        <div className="bg-neutral-50 p-12 rounded-2xl border border-dashed border-neutral-300 flex flex-col items-center justify-center text-center">
                          <FileSpreadsheet className="w-10 h-10 text-neutral-400 mb-3" />
                          <h4 className="text-sm font-bold text-charcoal mb-1">No Cheques</h4>
                          <p className="text-xs text-muted-foreground mb-4">This customer has no cheque history.</p>
                          <Button onClick={() => setChequePanel('new')} className="bg-white border border-neutral-300 hover:bg-neutral-100 text-charcoal h-8 text-xs shadow-sm"><Plus className="w-3 h-3 mr-1"/> Issue Cheque</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedUser.cheques.map(cheque => (
                            <div 
                              key={cheque.id} 
                              onClick={() => setChequePanel(cheque)}
                              className="p-3 bg-[#F4F1EA] border border-[#D5D0C5] rounded-lg shadow-sm relative overflow-hidden cursor-pointer hover:border-vintage-gold transition-all flex justify-between items-center"
                            >
                              <div>
                                <p className="text-xs font-mono font-bold text-charcoal">CHQ-{cheque.chequeNumber}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Payee: {cheque.payeeName || 'Cash'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-sm">{cheque.amount ? `$${cheque.amount.toFixed(2)}` : 'Blank'}</p>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${cheque.status === 'CLEARED' ? 'bg-green-200 text-green-800' : cheque.status === 'BOUNCED' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>{cheque.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Statements */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4"/> Statements</h4>
                        <form action={async (fd) => {
                           if(selectedUser.accounts.length === 0) {
                             toast.error('User has no accounts');
                             return;
                           }
                           fd.append('accountId', selectedUser.accounts[0].id);
                           const period = prompt("Enter Statement Period (e.g., 2026-10):");
                           if(period) {
                             fd.append('period', period);
                             await generateStatement(fd);
                           }
                        }}>
                          <Button type="submit" variant="outline" size="small" className="h-7 text-xs border-dashed"><Plus className="w-3 h-3 mr-1"/> Generate Statement</Button>
                        </form>
                      </div>
                      
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
                                          toast.success(`Account statement for period ${stmt.period} has been sent to ${selectedUser.email}`);
                                        } catch (err: any) {
                                          toast.error(err.message || 'Failed to dispatch statement email');
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

                {/* EMPLOYMENT TAB */}
                {activeTab === 'employment' && selectedUser.registrationForm && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Employment & Finance</h4>
                      <Button variant="ghost" size="small" onClick={() => handleEditToggle('employment')} className="text-blue-600 hover:bg-blue-50">
                        {editMode.employment ? <><X className="w-4 h-4 mr-1"/> Cancel</> : <><Edit2 className="w-4 h-4 mr-1"/> Edit Info</>}
                      </Button>
                    </div>

                    <form onSubmit={(e) => handleSaveForm(e, 'employment')} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm relative">
                      {editMode.employment && (
                        <div className="absolute top-4 right-4 z-10">
                          <Button type="submit" variant="primary" size="small" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <Check className="w-4 h-4 mr-1"/> Save Changes
                          </Button>
                        </div>
                      )}
                      
                      <h5 className="text-xs font-bold uppercase border-b pb-2 mb-4 text-charcoal">Employment Profile</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
                        {[
                          ['employmentStatus', 'Status', selectedUser.registrationForm.employmentStatus],
                          ['occupation', 'Occupation', selectedUser.registrationForm.occupation],
                          ['employerName', 'Employer Name', selectedUser.registrationForm.employerName],
                          ['employerAddress', 'Employer Address', selectedUser.registrationForm.employerAddress],
                        ].map(([key, label, value]) => (
                          <div key={key} className={key.includes('Address') ? "sm:col-span-2" : ""}>
                            <label className="text-muted-foreground block text-xs mb-1 uppercase font-semibold">{label}</label>
                            {editMode.employment ? (
                              <input type="text" name={key} defaultValue={value} className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-vintage-gold focus:ring-1 focus:ring-vintage-gold outline-none" />
                            ) : (
                              <div className="font-medium text-charcoal">{value || 'N/A'}</div>
                            )}
                          </div>
                        ))}
                      </div>

                      <h5 className="text-xs font-bold uppercase border-b pb-2 mb-4 text-charcoal">Financial Data</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        {[
                          ['primarySourceOfFunds', 'Source of Funds', selectedUser.registrationForm.primarySourceOfFunds],
                          ['estimatedAnnualIncome', 'Est. Annual Income', selectedUser.registrationForm.estimatedAnnualIncome],
                        ].map(([key, label, value]) => (
                          <div key={key}>
                            <label className="text-muted-foreground block text-xs mb-1 uppercase font-semibold">{label}</label>
                            {editMode.employment ? (
                              <input type="text" name={key} defaultValue={value} className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-vintage-gold focus:ring-1 focus:ring-vintage-gold outline-none" />
                            ) : (
                              <div className="font-medium text-charcoal">{value || 'N/A'}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </form>
                  </div>
                )}

                {/* KYC TAB */}
                {activeTab === 'kyc' && selectedUser.registrationForm && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identity & KYC</h4>
                      <Button variant="ghost" size="small" onClick={() => handleEditToggle('kyc')} className="text-blue-600 hover:bg-blue-50">
                        {editMode.kyc ? <><X className="w-4 h-4 mr-1"/> Cancel</> : <><Edit2 className="w-4 h-4 mr-1"/> Edit Info</>}
                      </Button>
                    </div>

                    <form onSubmit={(e) => handleSaveForm(e, 'kyc')} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm relative">
                      {editMode.kyc && (
                        <div className="absolute top-4 right-4 z-10">
                          <Button type="submit" variant="primary" size="small" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <Check className="w-4 h-4 mr-1"/> Save Changes
                          </Button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-sm mb-6 mt-4">
                        {[
                          ['primaryIdType', 'ID Type', selectedUser.registrationForm.primaryIdType],
                          ['idNumber', 'ID Number', selectedUser.registrationForm.idNumber],
                          ['stateCountryOfIssuance', 'Issuing Authority', selectedUser.registrationForm.stateCountryOfIssuance],
                          ['issueDate', 'Issue Date (YYYY-MM-DD)', selectedUser.registrationForm.issueDate ? format(new Date(selectedUser.registrationForm.issueDate), 'yyyy-MM-dd') : ''],
                          ['expirationDate', 'Expiry Date (YYYY-MM-DD)', selectedUser.registrationForm.expirationDate ? format(new Date(selectedUser.registrationForm.expirationDate), 'yyyy-MM-dd') : ''],
                        ].map(([key, label, value]) => (
                          <div key={key}>
                            <label className="text-muted-foreground block text-xs mb-1 uppercase font-semibold">{label}</label>
                            {editMode.kyc ? (
                              <input type="text" name={key} defaultValue={value} className="w-full px-3 py-1.5 border border-neutral-300 rounded text-sm focus:border-vintage-gold focus:ring-1 focus:ring-vintage-gold outline-none" />
                            ) : (
                              <div className="font-medium text-charcoal">{value || 'N/A'}</div>
                            )}
                          </div>
                        ))}
                      </div>

                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal border-b pb-2 mb-4">Uploaded Documents</h4>
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
                                <a href={selectedUser.registrationForm.idFrontDocumentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex flex-col items-center gap-2"><FileText className="w-8 h-8"/>View PDF</a>
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
                                <a href={selectedUser.registrationForm.idBackDocumentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex flex-col items-center gap-2"><FileText className="w-8 h-8"/>View PDF</a>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not provided</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* EPORTAL TAB */}
                {activeTab === 'eportal' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-100">
                        <div className={`p-4 rounded-full ${selectedUser.hasOnlineAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedUser.hasOnlineAccess ? <ShieldCheck className="w-8 h-8"/> : <Lock className="w-8 h-8"/>}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-charcoal">e-Portal Access Configuration</h4>
                          <p className="text-sm text-muted-foreground">Manage web banking privileges and notification overlays.</p>
                        </div>
                      </div>

                      <form action={async (fd) => {
                        await updateEportalStatus(fd);
                        toast.success('e-Portal settings updated');
                        setSelectedUser(prev => prev ? ({ ...prev, eportalStatus: fd.get('eportalStatus') as string, eportalNotificationMessage: fd.get('eportalNotificationMessage') as string, hasOnlineAccess: fd.get('eportalStatus') === 'ACTIVE' }) : null);
                      }} className="space-y-6">
                        <input type="hidden" name="id" value={selectedUser.id} />
                        
                        <div>
                          <label className="text-sm font-semibold text-charcoal block mb-2">Access Status</label>
                          <select name="eportalStatus" defaultValue={selectedUser.eportalStatus} className="w-full md:w-1/2 bg-neutral-50 border border-neutral-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold">
                            <option value="ACTIVE">Active (Granted)</option>
                            <option value="SUSPENDED">Suspended (Temporary)</option>
                            <option value="FLAGGED">Flagged (Investigation)</option>
                            <option value="BLOCKED">Blocked (Permanent)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-charcoal block mb-2">Custom Notification Message (Optional)</label>
                          <p className="text-xs text-muted-foreground mb-2">If provided, this message will display when the user attempts to log in while Suspended/Flagged/Blocked. Otherwise a default message is shown.</p>
                          <textarea 
                            name="eportalNotificationMessage" 
                            defaultValue={selectedUser.eportalNotificationMessage || ''} 
                            placeholder="e.g. Your Account Access has been suspended, kindly contact CCU."
                            className="w-full h-24 bg-neutral-50 border border-neutral-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold"
                          ></textarea>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-neutral-100">
                          <Button type="submit" variant="primary" className="bg-[#0D2545] hover:bg-[#1B355B] text-white">
                            Save Portal Settings
                          </Button>
                          
                          {/* Request Access Button (only if not active) */}
                          {!selectedUser.hasOnlineAccess && (
                            <Button 
                              type="button"
                              onClick={async () => {
                                const fd = new FormData();
                                fd.append('id', selectedUser.id);
                                await requestOnlineAccess(fd);
                                toast.success('e-Portal access application request initiated. Check Application Mgmt Hub.');
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-none"
                            >
                              Initiate Access Request
                            </Button>
                          )}
                        </div>
                      </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-charcoal border-b pb-2 mb-4">Access Credentials</h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Login Email</label>
                            <input type="text" readOnly value={selectedUser.email} className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded text-sm text-charcoal font-medium select-all" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Current/Last Known Password</label>
                            {selectedUser.temporaryPassword ? (
                              <input type="text" readOnly value={selectedUser.temporaryPassword} className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900 font-mono font-bold select-all" />
                            ) : (
                              <div className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded text-sm text-muted-foreground italic">
                                Hidden (Hashed by user)
                              </div>
                            )}
                          </div>
                        </div>

                        <form action={async (fd) => {
                          try {
                            await updateEportalCredentials(fd);
                            toast.success('Password updated successfully. The new password is now visible.');
                            // Optimistically update the UI
                            setSelectedUser(prev => prev ? ({ ...prev, temporaryPassword: fd.get('newPassword') as string }) : null);
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to update password');
                          }
                        }} className="pt-4 mt-4 border-t border-neutral-100">
                          <input type="hidden" name="id" value={selectedUser.id} />
                          <label className="text-xs font-semibold text-charcoal uppercase block mb-2">Set New Password</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              name="newPassword" 
                              placeholder="Enter new password (min 6 chars)" 
                              className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold"
                              minLength={6}
                              required
                            />
                            <Button type="submit" variant="primary" className="bg-[#0D2545] hover:bg-[#1B355B] text-white whitespace-nowrap">
                              Update Password
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Updating the password will immediately override the user's current password and display the new plain text password here for you to copy and share with the user.</p>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Account Management Panel (Sub-modal) */}
      <Dialog open={!!accountPanel} onOpenChange={(open) => !open && setAccountPanel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-playfair flex items-center gap-2 text-[color:var(--heritage-navy)]">
              <Building2 className="w-5 h-5 text-[color:var(--heritage-gold)]"/> 
              {accountPanel === 'new' ? 'Create New Account' : 'Manage Account'}
            </DialogTitle>
          </DialogHeader>
          {accountPanel === 'new' ? (
             <form action={async (fd) => {
               fd.append('userId', selectedUser!.id);
               await createAccount(fd);
               setAccountPanel(null);
               toast.success('Account created successfully');
             }} className="space-y-4 pt-4">
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase">Account Type</label>
                 <select name="accountType" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-neutral-50">
                   <option>Everyday Checking</option>
                   <option>High-Yield Savings</option>
                   <option>Private Wealth Reserve</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase">Initial Balance ($)</label>
                 <input type="number" step="0.01" name="initialBalance" defaultValue={0} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-neutral-50"/>
               </div>
               <Button type="submit" className="w-full bg-[color:var(--heritage-navy)] text-white hover:bg-[color:var(--heritage-navy)]/90">Create Account</Button>
             </form>
          ) : accountPanel && (
            <div className="space-y-6 pt-4">
              <div className="bg-gradient-to-r from-neutral-50 to-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--heritage-gold)]">{accountPanel.accountType}</p>
                  <p className="font-mono text-lg mt-1 text-charcoal">{accountPanel.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Balance</p>
                  <p className="font-mono font-bold text-lg">${accountPanel.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <form action={async (fd) => {
                 fd.append('id', accountPanel.id);
                 await updateAccount(fd);
                 setAccountPanel(null);
                 toast.success('Account updated successfully');
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Set Balance ($)</label>
                    <input type="number" step="0.01" name="balance" defaultValue={accountPanel.balance} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono bg-neutral-50 focus:border-[color:var(--heritage-gold)] focus:ring-1 focus:ring-[color:var(--heritage-gold)] outline-none"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Account Status</label>
                    <select name="status" defaultValue={accountPanel.status} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-neutral-50 focus:border-[color:var(--heritage-gold)] focus:ring-1 focus:ring-[color:var(--heritage-gold)] outline-none">
                      <option>ACTIVE</option>
                      <option>SUSPENDED</option>
                      <option>FROZEN</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[color:var(--heritage-navy)] hover:bg-[color:var(--heritage-navy)]/90 text-white">Save Changes</Button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-red-100">
                <h5 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-4">Danger Zone</h5>
                <form action={async (fd) => {
                   if(!confirm('Are you absolutely sure you want to permanently delete this account? This cannot be undone.')) return;
                   fd.append('id', accountPanel.id);
                   await deleteAccount(fd);
                   setAccountPanel(null);
                   toast.success('Account deleted permanently');
                }}>
                  <Button type="submit" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" variant="outline">Delete Account</Button>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Card Management Panel */}
      <Dialog open={!!cardPanel} onOpenChange={(open) => !open && setCardPanel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-playfair flex items-center gap-2">
              <CardIcon className="w-5 h-5"/> 
              {cardPanel === 'new' ? 'Issue New Card' : 'Manage Card'}
            </DialogTitle>
          </DialogHeader>
          {cardPanel === 'new' ? (
             <form action={async (fd) => {
               if(selectedUser!.accounts.length === 0) {
                 toast.error('User has no accounts to attach a card to.');
                 return;
               }
               await issueCard(fd);
               setCardPanel(null);
               toast.success('Card issued.');
             }} className="space-y-4 pt-4">
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase">Attach to Account</label>
                 <select name="accountId" className="w-full mt-1 px-3 py-2 border rounded text-sm font-mono">
                   {selectedUser?.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountNumber} - {acc.accountType}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
                   <select name="cardType" className="w-full mt-1 px-3 py-2 border rounded text-sm">
                     <option>DEBIT</option>
                     <option>CREDIT</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-semibold text-muted-foreground uppercase">Network</label>
                   <select name="network" className="w-full mt-1 px-3 py-2 border rounded text-sm">
                     <option>VISA</option>
                     <option>MASTERCARD</option>
                     <option>AMEX</option>
                   </select>
                 </div>
               </div>
               <Button type="submit" className="w-full bg-[#0D2545] text-white">Issue Card</Button>
             </form>
          ) : cardPanel && (
            <div className="space-y-6 pt-4">
              <div className="bg-charcoal text-white p-4 rounded-lg text-center">
                <p className="text-xs font-bold uppercase">{cardPanel.cardType} CARD</p>
                <p className="font-mono text-xl mt-2 tracking-widest">{cardPanel.cardNumber}</p>
              </div>
              <form action={async (fd) => {
                 fd.append('id', cardPanel.id);
                 await updateCard(fd);
                 setCardPanel(null);
              }} className="space-y-4 border-b border-neutral-100 pb-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                  <select name="status" defaultValue={cardPanel.status} className="w-full mt-1 px-3 py-2 border rounded text-sm">
                    <option>ACTIVE</option>
                    <option>FROZEN</option>
                    <option>BLOCKED</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" variant="outline">Save Status</Button>
              </form>
              <form action={async (fd) => {
                 if(!confirm('Delete this card?')) return;
                 fd.append('id', cardPanel.id);
                 await deleteCard(fd);
                 setCardPanel(null);
              }}>
                <Button type="submit" className="w-full text-red-600 border-red-200 hover:bg-red-50" variant="outline">Delete Card</Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cheque Management Panel */}
      <Dialog open={!!chequePanel} onOpenChange={(open) => !open && setChequePanel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-playfair flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5"/> 
              {chequePanel === 'new' ? 'Issue Single Cheque' : 'Manage Cheque'}
            </DialogTitle>
          </DialogHeader>
          {chequePanel === 'new' ? (
             <form action={async (fd) => {
               if(selectedUser!.accounts.length === 0) {
                 toast.error('No accounts available.');
                 return;
               }
               await issueCheque(fd);
               setChequePanel(null);
             }} className="space-y-4 pt-4">
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase">Draw on Account</label>
                 <select name="accountId" className="w-full mt-1 px-3 py-2 border rounded text-sm font-mono">
                   {selectedUser?.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountNumber}</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase">Amount ($) - Optional</label>
                 <input type="number" step="0.01" name="amount" className="w-full mt-1 px-3 py-2 border rounded text-sm" placeholder="Leave blank for open cheque"/>
               </div>
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase">Payee Name - Optional</label>
                 <input type="text" name="payeeName" className="w-full mt-1 px-3 py-2 border rounded text-sm"/>
               </div>
               <Button type="submit" className="w-full bg-[#0D2545] text-white">Generate Cheque</Button>
             </form>
          ) : chequePanel && (
            <div className="space-y-6 pt-4">
              <div className="bg-[#F4F1EA] p-4 rounded-lg border border-[#D5D0C5] flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-charcoal">CHQ-{chequePanel.chequeNumber}</p>
                  <p className="text-sm font-mono mt-1">${chequePanel.amount || '---'}</p>
                </div>
                <p className="text-xs uppercase font-bold text-neutral-500">{chequePanel.status}</p>
              </div>
              <form action={async (fd) => {
                 fd.append('id', chequePanel.id);
                 await updateCheque(fd);
                 setChequePanel(null);
              }} className="space-y-4 border-b border-neutral-100 pb-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Update Status</label>
                  <select name="status" defaultValue={chequePanel.status} className="w-full mt-1 px-3 py-2 border rounded text-sm">
                    <option>ISSUED</option>
                    <option>CLEARED</option>
                    <option>BOUNCED</option>
                    <option>CANCELLED</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" variant="outline">Save Status</Button>
              </form>
              <form action={async (fd) => {
                 if(!confirm('Delete this cheque record?')) return;
                 fd.append('id', chequePanel.id);
                 await deleteCheque(fd);
                 setChequePanel(null);
              }}>
                <Button type="submit" className="w-full text-red-600 border-red-200 hover:bg-red-50" variant="outline">Delete Record</Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
