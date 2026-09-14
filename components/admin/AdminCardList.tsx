"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CreditCard, Search, Filter, ShieldCheck, ShieldAlert, ZapOff } from "lucide-react";
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

type AdminCard = {
  id: string;
  cardNumber: string;
  cardType: string;
  network: string;
  expiryDate: Date;
  cvv: string;
  status: string;
  createdAt: Date;
  account: {
    accountNumber: string;
    user: {
      firstName: string;
      lastName: string;
    }
  };
};

export function AdminCardList({ 
  initialCards,
  onToggleStatus
}: { 
  initialCards: AdminCard[];
  onToggleStatus: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCard, setSelectedCard] = useState<AdminCard | null>(null);

  const filtered = initialCards.filter((card) => {
    const matchesSearch = 
      card.cardNumber.includes(searchTerm) ||
      card.account.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.account.user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || card.status === statusFilter;
    
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
            placeholder="Search card number or customer name..." 
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
            <option value="FROZEN">Frozen</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Card Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No cards found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono text-sm tracking-widest text-charcoal">
                    **** **** **** {card.cardNumber.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal">{card.account.user.firstName} {card.account.user.lastName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{card.account.accountNumber}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-xs text-blue-800">{card.network}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium uppercase">{card.cardType}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      card.status === 'FROZEN' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {card.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => setSelectedCard(card)}
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
      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Card Management
            </DialogTitle>
            <DialogDescription>
              Review and manage physical or virtual cards.
            </DialogDescription>
          </DialogHeader>

          {selectedCard && (
            <div className="space-y-6 py-4">
              {/* Virtual Card Representation */}
              <div className="bg-charcoal text-white rounded-xl p-6 relative overflow-hidden shadow-lg border border-neutral-800">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <span className="font-playfair font-bold tracking-wider">{selectedCard.network}</span>
                  <CreditCard className="w-6 h-6 opacity-80" />
                </div>
                
                <div className="space-y-1 relative z-10">
                  <p className="font-mono text-xl tracking-widest">{selectedCard.cardNumber.match(/.{1,4}/g)?.join(' ')}</p>
                </div>
                
                <div className="flex justify-between items-end mt-6 relative z-10">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Cardholder</p>
                    <p className="font-medium text-sm tracking-wider uppercase">{selectedCard.account.user.firstName} {selectedCard.account.user.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Expires</p>
                    <p className="font-mono text-sm">{format(new Date(selectedCard.expiryDate), 'MM/yy')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Security Status</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-charcoal">Current Status:</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedCard.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    selectedCard.status === 'FROZEN' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedCard.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-charcoal">CVV Verification:</span>
                  <span className="font-mono text-sm text-muted-foreground">{selectedCard.cvv}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-charcoal">Linked Account:</span>
                  <span className="font-mono text-sm text-muted-foreground">{selectedCard.account.accountNumber}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
                <form action={onToggleStatus}>
                  <input type="hidden" name="id" value={selectedCard.id} />
                  <input type="hidden" name="status" value={selectedCard.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE'} />
                  <Button type="submit" variant={selectedCard.status === 'ACTIVE' ? 'outline' : 'primary'} className="w-full text-charcoal border-charcoal hover:bg-neutral-100">
                    {selectedCard.status === 'ACTIVE' ? (
                      <><ShieldAlert className="w-4 h-4 mr-2" /> Freeze Card</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4 mr-2" /> Unfreeze Card</>
                    )}
                  </Button>
                </form>

                <form action={onToggleStatus}>
                  <input type="hidden" name="id" value={selectedCard.id} />
                  <input type="hidden" name="status" value="CLOSED" />
                  <Button type="submit" variant="primary" className="w-full bg-red-600 hover:bg-red-700 text-white border-none shadow-none" disabled={selectedCard.status === 'CLOSED'}>
                    <ZapOff className="w-4 h-4 mr-2" /> Permanently Block
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
