"use client";

import { useState } from "react";
import { format } from "date-fns";
import { BellRing, Send, Search, CheckCircle2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  }
};

type UserOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export function AdminNotificationList({ 
  initialNotifications,
  users,
  onSendNotification
}: { 
  initialNotifications: AdminNotification[];
  users: UserOption[];
  onSendNotification: (formData: FormData) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("ALL");

  const filtered = initialNotifications.filter((n) => {
    return n.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           n.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           n.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSendNotification(formData);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      
      {/* Compose Notification */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-4">
          <Send className="w-5 h-5 text-vintage-gold" />
          <h3 className="font-playfair text-lg font-bold text-charcoal">Send New Notification</h3>
        </div>

        <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipient</label>
              <select 
                name="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              >
                <option value="ALL">All Customers (Broadcast)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notification Title</label>
              <input 
                type="text" 
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Maintenance Update"
                required
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message Body</label>
            <textarea 
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the notification message here..."
              required
              rows={3}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50 resize-none"
            />
          </div>

          <Button type="submit" className="bg-charcoal text-white hover:bg-neutral-800">
            Push Notification
          </Button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
          <h3 className="font-semibold text-charcoal">Notification History</h3>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search history..." 
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Date Sent</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Message Details</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No sent notifications found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(n.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-charcoal">{n.user.firstName} {n.user.lastName}</div>
                    <div className="text-xs text-muted-foreground">{n.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-sm text-charcoal">{n.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-md">{n.message}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {n.isRead ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
                        <BellRing className="w-3 h-3" /> Unread
                      </span>
                    )}
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
