"use client";

import { useState } from "react";
import { format, subHours, subDays } from "date-fns";
import { LifeBuoy, Search, Filter, Reply, CheckCircle2, Clock } from "lucide-react";
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

type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  senderName: string;
  senderEmail: string;
  status: string;
  priority: string;
  createdAt: Date;
};

// Static mock data since we don't have a SupportMessage model in Prisma
const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TKT-1049",
    subject: "International Wire Transfer Delayed",
    message: "I sent a wire transfer 3 days ago to the UK and the recipient hasn't received it yet. Can you please track it?",
    senderName: "Alice Walker",
    senderEmail: "alice@example.com",
    status: "OPEN",
    priority: "HIGH",
    createdAt: subHours(new Date(), 2)
  },
  {
    id: "TKT-1048",
    subject: "Need help setting up Auto-Pay",
    message: "I'm trying to set up auto-pay for my mortgage bill but the system keeps throwing an error. Attached a screenshot.",
    senderName: "Bob Smith",
    senderEmail: "bob.smith@example.com",
    status: "OPEN",
    priority: "MEDIUM",
    createdAt: subHours(new Date(), 5)
  },
  {
    id: "TKT-1047",
    subject: "Requesting higher transfer limit",
    message: "I need to purchase a property and require my daily transfer limit to be increased to $150,000 for this week only.",
    senderName: "Charles Davies",
    senderEmail: "charles.d@example.com",
    status: "CLOSED",
    priority: "HIGH",
    createdAt: subDays(new Date(), 1)
  }
];

export function AdminSupportList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Local state for demo purposes to simulate resolving tickets
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);

  const filtered = tickets.filter((tkt) => {
    const matchesSearch = 
      tkt.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tkt.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tkt.senderEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || tkt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleResolve = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "CLOSED" } : t));
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
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
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tkt) => (
                <TableRow key={tkt.id} className={tkt.status === 'CLOSED' ? 'opacity-60' : ''}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{tkt.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal">{tkt.senderName}</div>
                    <div className="text-xs text-muted-foreground">{tkt.senderEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal max-w-[200px] truncate">{tkt.subject}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {format(tkt.createdAt, 'MMM d, HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      tkt.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                      tkt.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tkt.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      tkt.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {tkt.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => setSelectedTicket(tkt)}
                      className="text-vintage-gold hover:text-vintage-gold hover:bg-vintage-gold/10"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair flex items-center gap-2">
              <LifeBuoy className="w-5 h-5" /> Support Ticket: {selectedTicket?.id}
            </DialogTitle>
            <DialogDescription>
              Review customer inquiry and resolve the issue.
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-start border-b border-neutral-200 pb-4 mb-4">
                  <div>
                    <h3 className="font-medium text-lg text-charcoal">{selectedTicket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">From: <span className="font-medium text-charcoal">{selectedTicket.senderName}</span> ({selectedTicket.senderEmail})</p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      selectedTicket.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                      selectedTicket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedTicket.priority}
                    </span>
                    <br/>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      selectedTicket.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
                
                <div className="prose prose-sm text-charcoal">
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedTicket.status === 'OPEN' && (
                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Reply (Email Customer)</label>
                    <textarea 
                      placeholder="Type your response here..."
                      rows={4}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" className="text-neutral-600" onClick={() => setSelectedTicket(null)}>
                      Cancel
                    </Button>
                    <Button className="bg-charcoal text-white hover:bg-neutral-800" onClick={() => handleResolve(selectedTicket.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Send Reply & Resolve Ticket
                    </Button>
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
