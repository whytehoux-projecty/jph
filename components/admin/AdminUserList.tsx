"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Users, Search, Filter, ShieldAlert, ShieldCheck, UserCheck, UserX, Crown, User as UserIcon } from "lucide-react";
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
import { resetUserPassword } from "@/app/actions/admin";
import { LogIn, Key, Trash2 } from "lucide-react";

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
  accounts: {
    id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    status: string;
  }[];
};

export function AdminUserList({ 
  initialUsers,
  onToggleStatus,
  onToggleTier
}: { 
  initialUsers: AdminUser[];
  onToggleStatus: (formData: FormData) => void;
  onToggleTier: (formData: FormData) => void;
  onDeletePin: (formData: FormData) => void;
  onLoginAs: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <Users className="w-5 h-5" /> Customer Management
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

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Linked Accounts</h4>
                {selectedUser.accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No accounts opened yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedUser.accounts.map(acc => (
                      <div key={acc.id} className="p-3 bg-white border border-neutral-200 rounded-md shadow-sm flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold text-charcoal uppercase">{acc.accountType}</p>
                          <p className="text-xs font-mono text-muted-foreground">{acc.accountNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium text-sm">${acc.balance.toFixed(2)}</p>
                          <span className="text-[10px] text-green-600 font-bold uppercase">{acc.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
