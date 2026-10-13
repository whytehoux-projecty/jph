"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Snowflake,
  ShieldAlert,
  Edit2,
  Trash2,
  Eye,
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  Building2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import {
  adminApproveCardRequest,
  adminDeclineCardRequest,
  adminCreateCardDirect,
  adminUpdateCustomerCard,
  adminDeleteCustomerCard,
} from "@/app/actions/cards";

export interface AdminCardItem {
  id: string;
  cardNumber: string;
  cardType: string;
  network?: string | null;
  cardTier?: string | null;
  cardImageUrl?: string | null;
  dailyLimit?: number | null;
  status: string;
  expiryDate: Date | string;
  cvv: string;
  createdAt: Date | string;
  account: {
    id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
}

export interface AdminCardRequestItem {
  id: string;
  userId: string;
  accountId?: string | null;
  cardType: string;
  cardTier?: string | null;
  cardholderName?: string | null;
  billingAddress?: string | null;
  requestedLimit?: number | null;
  status: string;
  rejectionReason?: string | null;
  cardImageUrl?: string | null;
  createdAt: Date | string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  account?: {
    id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
  } | null;
}

export interface UserWithAccounts {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  accounts: Array<{
    id: string;
    accountType: string;
    accountNumber: string;
    balance: number;
    isPrimary?: boolean;
  }>;
}

interface AdminCardsManagerProps {
  cards: AdminCardItem[];
  cardRequests: AdminCardRequestItem[];
  usersWithAccounts: UserWithAccounts[];
}

const PRESET_ARTWORKS = [
  {
    name: "Classic Pine",
    id: "pine",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    gradient: "from-emerald-950 via-teal-900 to-slate-950",
  },
  {
    name: "Onyx Platinum",
    id: "onyx",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    gradient: "from-zinc-900 via-neutral-800 to-black",
  },
  {
    name: "Gold Reserve",
    id: "gold",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    gradient: "from-amber-700 via-yellow-600 to-amber-950",
  },
  {
    name: "Swiss Obsidian",
    id: "obsidian",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
    gradient: "from-slate-900 via-indigo-950 to-black",
  },
];

export function AdminCardsManager({
  cards,
  cardRequests,
  usersWithAccounts,
}: AdminCardsManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"requests" | "cards">("requests");

  // Search & Filter
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");
  const [cardSearch, setCardSearch] = useState("");
  const [cardTypeFilter, setCardTypeFilter] = useState("ALL");
  const [cardStatusFilter, setCardStatusFilter] = useState("ALL");

  // Approval Modal State
  const [approvingRequest, setApprovingRequest] = useState<AdminCardRequestItem | null>(null);
  const [approveForm, setApproveForm] = useState({
    network: "VISA",
    cardTier: "STANDARD",
    dailyLimit: 2500,
    cardImageUrl: "",
    customCardNumber: "",
    cvv: "",
  });
  const [isApproving, setIsApproving] = useState(false);

  // Decline Modal State
  const [decliningRequest, setDecliningRequest] = useState<AdminCardRequestItem | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);

  // Direct Issue Modal State
  const [isDirectIssueOpen, setIsDirectIssueOpen] = useState(false);
  const [directForm, setDirectForm] = useState({
    userId: "",
    accountId: "",
    cardType: "DEBIT",
    cardTier: "STANDARD",
    network: "VISA",
    dailyLimit: 2500,
    cardImageUrl: "",
  });
  const [isDirectIssuing, setIsDirectIssuing] = useState(false);

  // Edit Card Modal State
  const [editingCard, setEditingCard] = useState<AdminCardItem | null>(null);
  const [editForm, setEditForm] = useState({
    dailyLimit: 2500,
    cardTier: "STANDARD",
    cardImageUrl: "",
    status: "ACTIVE",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Delete Card Confirmation
  const [deletingCard, setDeletingCard] = useState<AdminCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats calculation
  const pendingRequestsCount = cardRequests.filter((r) => r.status === "PENDING").length;
  const totalCardsCount = cards.length;
  const activeCardsCount = cards.filter((c) => c.status === "ACTIVE").length;
  const frozenCardsCount = cards.filter((c) => c.status === "FROZEN").length;
  const totalCreditLimit = cards
    .filter((c) => c.cardType.toUpperCase() === "CREDIT")
    .reduce((sum, c) => sum + (c.dailyLimit || 0), 0);

  // Filtered requests
  const filteredRequests = cardRequests.filter((req) => {
    const matchesStatus =
      requestStatusFilter === "ALL" || req.status === requestStatusFilter;
    const customerName = `${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.email} ${req.cardholderName || ""}`.toLowerCase();
    const matchesSearch =
      !requestSearch || customerName.includes(requestSearch.toLowerCase()) || req.id.toLowerCase().includes(requestSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered cards
  const filteredCards = cards.filter((card) => {
    const matchesType =
      cardTypeFilter === "ALL" || card.cardType.toUpperCase() === cardTypeFilter;
    const matchesStatus =
      cardStatusFilter === "ALL" || card.status === cardStatusFilter;
    const customer = `${card.account.user.firstName || ""} ${card.account.user.lastName || ""} ${card.account.user.email} ${card.cardNumber}`.toLowerCase();
    const matchesSearch =
      !cardSearch || customer.includes(cardSearch.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Open Approval Dialog
  const handleOpenApprove = (req: AdminCardRequestItem) => {
    setApprovingRequest(req);
    setApproveForm({
      network: req.cardType === "CREDIT" ? "MASTERCARD" : "VISA",
      cardTier: req.cardTier || "STANDARD",
      dailyLimit: req.cardType === "CREDIT" ? (req.requestedLimit || 10000) : 2500,
      cardImageUrl: req.cardImageUrl || "",
      customCardNumber: "",
      cvv: Math.floor(100 + Math.random() * 900).toString(),
    });
  };

  // Submit Approval
  const handleApproveSubmit = async () => {
    if (!approvingRequest) return;
    setIsApproving(true);
    try {
      await adminApproveCardRequest({
        requestId: approvingRequest.id,
        network: approveForm.network,
        cardImageUrl: approveForm.cardImageUrl || undefined,
        dailyLimit: Number(approveForm.dailyLimit),
        cardNumber: approveForm.customCardNumber || undefined,
        cvv: approveForm.cvv || undefined,
      });
      toast.success({
        title: "Card Approved & Issued",
        description: `Customer card has been issued and linked to active ledger.`,
      });
      setApprovingRequest(null);
      router.refresh();
    } catch (err: any) {
      toast.error({
        title: "Approval Failed",
        description: err.message || "Could not approve card request.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  // Submit Decline
  const handleDeclineSubmit = async () => {
    if (!decliningRequest) return;
    setIsDeclining(true);
    try {
      await adminDeclineCardRequest(decliningRequest.id, declineReason);
      toast.success({
        title: "Application Declined",
        description: "Customer has been notified of the underwriting decision.",
      });
      setDecliningRequest(null);
      setDeclineReason("");
      router.refresh();
    } catch (err: any) {
      toast.error({
        title: "Decline Failed",
        description: err.message || "Could not decline request.",
      });
    } finally {
      setIsDeclining(false);
    }
  };

  // Submit Direct Issuance
  const handleDirectIssueSubmit = async () => {
    if (!directForm.userId || !directForm.accountId) {
      toast.error({ title: "Incomplete Parameters", description: "Select a customer and vault account." });
      return;
    }
    setIsDirectIssuing(true);
    try {
      await adminCreateCardDirect({
        userId: directForm.userId,
        accountId: directForm.accountId,
        cardType: directForm.cardType,
        cardTier: directForm.cardTier,
        network: directForm.network,
        dailyLimit: Number(directForm.dailyLimit),
        cardImageUrl: directForm.cardImageUrl || undefined,
      });
      toast.success({
        title: "Card Issued Directly",
        description: `New card issued for customer successfully.`,
      });
      setIsDirectIssueOpen(false);
      setDirectForm({
        userId: "",
        accountId: "",
        cardType: "DEBIT",
        cardTier: "STANDARD",
        network: "VISA",
        dailyLimit: 2500,
        cardImageUrl: "",
      });
      router.refresh();
    } catch (err: any) {
      toast.error({
        title: "Issuance Error",
        description: err.message || "Failed to create card.",
      });
    } finally {
      setIsDirectIssuing(false);
    }
  };

  // Toggle Card Freeze/Unfreeze
  const handleToggleFreeze = async (card: AdminCardItem) => {
    const newStatus = card.status === "FROZEN" ? "ACTIVE" : "FROZEN";
    try {
      await adminUpdateCustomerCard(card.id, { status: newStatus });
      toast.success({
        title: newStatus === "FROZEN" ? "Card Frozen" : "Card Activated",
        description: `Card ending in •••• ${card.cardNumber.slice(-4)} is now ${newStatus.toLowerCase()}.`,
      });
      router.refresh();
    } catch (err: any) {
      toast.error({
        title: "Status Update Error",
        description: err.message || "Failed to update card status.",
      });
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (card: AdminCardItem) => {
    setEditingCard(card);
    setEditForm({
      dailyLimit: card.dailyLimit || 2500,
      cardTier: card.cardTier || "STANDARD",
      cardImageUrl: card.cardImageUrl || "",
      status: card.status,
    });
  };

  // Submit Edit
  const handleEditSubmit = async () => {
    if (!editingCard) return;
    setIsEditing(true);
    try {
      await adminUpdateCustomerCard(editingCard.id, {
        dailyLimit: Number(editForm.dailyLimit),
        cardTier: editForm.cardTier,
        cardImageUrl: editForm.cardImageUrl || undefined,
        status: editForm.status,
      });
      toast.success({
        title: "Card Updated",
        description: `Settings updated for card ending in •••• ${editingCard.cardNumber.slice(-4)}.`,
      });
      setEditingCard(null);
      router.refresh();
    } catch (err: any) {
      toast.error({
        title: "Update Failed",
        description: err.message || "Could not update card.",
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Submit Delete
  const handleDeleteSubmit = async () => {
    if (!deletingCard) return;
    setIsDeleting(true);
    try {
      await adminDeleteCustomerCard(deletingCard.id);
      toast.success({
        title: "Card Deleted",
        description: `Card ending in •••• ${deletingCard.cardNumber.slice(-4)} was removed.`,
      });
      setDeletingCard(null);
      router.refresh();
    } catch (err: any) {
      toast.error({
        title: "Delete Failed",
        description: err.message || "Could not delete card.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Selected user accounts for Direct Issuance
  const selectedUserForDirect = usersWithAccounts.find((u) => u.id === directForm.userId);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Underwriting Queue
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink-900">
              {pendingRequestsCount}
            </span>
            <span className="text-xs text-neutral-500">pending decisions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Active Cards
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink-900">
              {activeCardsCount}
            </span>
            <span className="text-xs text-neutral-500">of {totalCardsCount} total</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Credit Facilities
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink-900">
              ${totalCreditLimit.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500">cumulative limits</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Frozen Cards
            </span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
              <Snowflake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink-900">
              {frozenCardsCount}
            </span>
            <span className="text-xs text-neutral-500">risk holds</span>
          </div>
        </div>
      </div>

      {/* Tabs and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "requests"
                ? "bg-ink-900 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            Applications Queue
            {pendingRequestsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-400 text-amber-950">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "cards"
                ? "bg-ink-900 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            All Issued Cards ({totalCardsCount})
          </button>
        </div>

        <Button
          onClick={() => setIsDirectIssueOpen(true)}
          className="bg-vintage-gold hover:bg-vintage-gold/90 text-ink-900 font-bold"
          icon={<Plus className="w-4 h-4" />}
        >
          Direct Card Issuance
        </Button>
      </div>

      {/* TAB 1: APPLICATIONS QUEUE */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search by customer name, email, ref..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending Underwriting</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-neutral-500">
                <Clock className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                <p className="font-semibold text-ink-900 text-sm">No card applications match criteria</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Adjust filters or wait for customers to submit new card requests.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Application Ref</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Facility & Tier</th>
                      <th className="py-3 px-4">Funding / Limit</th>
                      <th className="py-3 px-4">Requested On</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Underwriting Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">
                          #{req.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-ink-900">
                            {req.user.firstName} {req.user.lastName}
                          </p>
                          <p className="text-neutral-500 text-[11px] font-mono">{req.user.email}</p>
                          {req.cardholderName && (
                            <p className="text-[10px] text-vintage-gold font-mono uppercase mt-0.5">
                              Emboss: {req.cardholderName}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                req.cardType === "CREDIT"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {req.cardType}
                            </span>
                            <span className="text-neutral-700 font-medium">
                              {req.cardTier ? req.cardTier.replace("_", " ") : "Standard"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {req.cardType === "CREDIT" ? (
                            <span className="font-bold text-ink-900">
                              ${req.requestedLimit ? req.requestedLimit.toLocaleString() : "5,000"} USD
                            </span>
                          ) : (
                            <span className="text-neutral-600">
                              {req.account ? `${req.account.accountType} (••••${req.account.accountNumber.slice(-4)})` : "Primary Depository"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 font-mono">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          {req.status === "PENDING" && (
                            <Badge variant="warning" className="text-[10px]">
                              Underwriting Review
                            </Badge>
                          )}
                          {req.status === "APPROVED" && (
                            <Badge variant="success" className="text-[10px]">
                              Approved & Issued
                            </Badge>
                          )}
                          {req.status === "REJECTED" && (
                            <Badge variant="destructive" className="text-[10px]">
                              Declined
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {req.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="small"
                                className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                                onClick={() => handleOpenApprove(req)}
                              >
                                <Check className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outline"
                                className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                onClick={() => {
                                  setDecliningRequest(req);
                                  setDeclineReason("");
                                }}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Decline
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL ISSUED CARDS */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search by cardholder, last 4 digits, email..."
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
                <SelectTrigger className="w-32 h-9 text-xs">
                  <SelectValue placeholder="Facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Facilities</SelectItem>
                  <SelectItem value="DEBIT">Debit Cards</SelectItem>
                  <SelectItem value="CREDIT">Credit Cards</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cardStatusFilter} onValueChange={setCardStatusFilter}>
                <SelectTrigger className="w-32 h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active Only</SelectItem>
                  <SelectItem value="FROZEN">Frozen Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredCards.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center text-neutral-500">
              <CreditCard className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
              <p className="font-semibold text-ink-900 text-sm">No cards match search criteria</p>
              <p className="text-xs text-neutral-400 mt-1">Try modifying your query or issue a new card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => {
                const isCredit = card.cardType.toUpperCase() === "CREDIT";
                const isFrozen = card.status === "FROZEN";
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                              isCredit
                                ? "bg-purple-100 text-purple-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {card.cardType}
                          </span>
                          <span className="text-xs font-semibold text-ink-900">
                            {card.cardTier || "Standard"}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-ink-900 mt-1">
                          {card.account.user.firstName} {card.account.user.lastName}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          {card.account.user.email}
                        </p>
                      </div>

                      <Badge variant={isFrozen ? "destructive" : "success"} className="text-[10px]">
                        {card.status}
                      </Badge>
                    </div>

                    {/* Mini Card Preview with custom artwork */}
                    <div
                      className={`relative h-28 rounded-lg p-3 overflow-hidden shadow-inner flex flex-col justify-between text-white ${
                        card.cardImageUrl
                          ? "bg-cover bg-center"
                          : isCredit
                          ? "bg-linear-to-br from-[#2C2C2C] via-[#4A4A4A] to-[#1A1A1A]"
                          : "bg-linear-to-br from-pine-700 via-pine-600 to-pine-800"
                      }`}
                      style={card.cardImageUrl ? { backgroundImage: `url(${card.cardImageUrl})` } : undefined}
                    >
                      {/* Dark overlay for contrast */}
                      <div className="absolute inset-0 bg-black/40 backdrop-brightness-90 pointer-events-none" />

                      <div className="relative z-10 flex justify-between items-start">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-300">
                          {card.network || (isCredit ? "Mastercard" : "Visa")}
                        </span>
                        {isFrozen && (
                          <span className="flex items-center gap-1 text-[9px] bg-red-600/80 px-2 py-0.5 rounded font-bold uppercase">
                            <Snowflake className="w-2.5 h-2.5" /> Frozen
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 space-y-1">
                        <p className="font-mono text-base tracking-widest font-bold">
                          •••• •••• •••• {card.cardNumber.slice(-4)}
                        </p>
                        <div className="flex justify-between items-center text-[9px] text-neutral-300 font-mono">
                          <span>EXP: {new Date(card.expiryDate).toLocaleDateString(undefined, { month: "2-digit", year: "2-digit" })}</span>
                          <span>CVV: {card.cvv}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-100">
                      <div>
                        <span className="text-neutral-500 text-[10px] uppercase block">Linked Vault</span>
                        <strong className="font-mono text-ink-900 text-xs">
                          {card.account.accountType} (••••{card.account.accountNumber.slice(-4)})
                        </strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[10px] uppercase block">Daily Cap</span>
                        <strong className="font-mono text-ink-900 text-xs">
                          ${card.dailyLimit ? card.dailyLimit.toLocaleString() : "2,500"} USD
                        </strong>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                      <Button
                        size="small"
                        variant={isFrozen ? "primary" : "outline"}
                        className={`h-7 text-xs flex-1 ${
                          isFrozen
                            ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                            : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                        onClick={() => handleToggleFreeze(card)}
                      >
                        {isFrozen ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Unfreeze
                          </>
                        ) : (
                          <>
                            <Snowflake className="w-3 h-3 mr-1 text-blue-500" /> Freeze
                          </>
                        )}
                      </Button>

                      <Button
                        size="small"
                        variant="outline"
                        className="h-7 text-xs text-neutral-700"
                        onClick={() => handleOpenEdit(card)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>

                      <Button
                        size="small"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => setDeletingCard(card)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APPROVAL MODAL */}
      <Dialog open={!!approvingRequest} onOpenChange={(open) => !open && setApprovingRequest(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-neutral-300">
          <div className="bg-neutral-900 text-white p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-vintage-gold mb-1">
              <Crown className="w-3.5 h-3.5" />
              Institutional Underwriting Desk
            </div>
            <DialogTitle className="text-xl font-bold font-display text-white">
              Approve Card Application
            </DialogTitle>
            <DialogDescription className="text-neutral-400 text-xs mt-0.5">
              Ref: #{approvingRequest?.id.slice(-6).toUpperCase()} · Customer: {approvingRequest?.user.firstName} {approvingRequest?.user.lastName} ({approvingRequest?.user.email})
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Facility Details */}
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Requested Facility:</span>
                <strong className="text-ink-900 font-bold">{approvingRequest?.cardType} CARD</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Embossed Cardholder:</span>
                <strong className="text-ink-900 font-mono">{approvingRequest?.cardholderName || "On File"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Linked Account / Vault:</span>
                <strong className="text-ink-900 font-mono">
                  {approvingRequest?.account
                    ? `${approvingRequest.account.accountType} (••••${approvingRequest.account.accountNumber.slice(-4)})`
                    : "Primary Depository Vault"}
                </strong>
              </div>
            </div>

            {/* Network & Tier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Payment Network</label>
                <Select
                  value={approveForm.network}
                  onValueChange={(val) => setApproveForm((p) => ({ ...p, network: val }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISA">VISA Infinite / Traditional</SelectItem>
                    <SelectItem value="MASTERCARD">Mastercard World Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Card Tier</label>
                <Select
                  value={approveForm.cardTier}
                  onValueChange={(val) => setApproveForm((p) => ({ ...p, cardTier: val }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard Edition</SelectItem>
                    <SelectItem value="GOLD_RESERVE">Gold Reserve</SelectItem>
                    <SelectItem value="ONYX_PLATINUM">Onyx Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Daily Limit & CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  {approvingRequest?.cardType === "CREDIT" ? "Credit Line / Daily Spend ($)" : "Daily Spending Limit ($)"}
                </label>
                <Input
                  type="number"
                  value={approveForm.dailyLimit}
                  onChange={(e) => setApproveForm((p) => ({ ...p, dailyLimit: Number(e.target.value) }))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Security CVV (3 Digits)</label>
                <Input
                  maxLength={3}
                  value={approveForm.cvv}
                  onChange={(e) => setApproveForm((p) => ({ ...p, cvv: e.target.value }))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Custom Card Artwork Selection */}
            <div className="space-y-2 pt-2 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-vintage-gold" />
                  Custom Card Artwork Backdrop
                </label>
                <span className="text-[10px] text-neutral-400">Select preset or paste image URL</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PRESET_ARTWORKS.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setApproveForm((p) => ({ ...p, cardImageUrl: art.url }))}
                    className={`h-14 rounded-lg p-1.5 flex flex-col justify-end text-white text-[9px] font-bold cursor-pointer transition-all border relative overflow-hidden bg-cover bg-center ${
                      approveForm.cardImageUrl === art.url
                        ? "border-vintage-gold ring-2 ring-vintage-gold"
                        : "border-neutral-300 hover:opacity-90"
                    }`}
                    style={{ backgroundImage: `url(${art.url})` }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <span className="relative z-10 leading-tight">{art.name}</span>
                  </div>
                ))}
              </div>

              <Input
                placeholder="Or paste external custom image URL (https://...)"
                value={approveForm.cardImageUrl}
                onChange={(e) => setApproveForm((p) => ({ ...p, cardImageUrl: e.target.value }))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-between">
            <Button variant="ghost" size="small" onClick={() => setApprovingRequest(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              disabled={isApproving}
              onClick={handleApproveSubmit}
            >
              {isApproving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              Issue Card to Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DECLINE MODAL */}
      <Dialog open={!!decliningRequest} onOpenChange={(open) => !open && setDecliningRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Decline Application
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide an official underwriting rationale. This explanation will be sent to the customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Decline Rationale</label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Depository balance requirement was not satisfied or credit history verification incomplete."
                className="w-full text-xs p-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="ghost" size="small" onClick={() => setDecliningRequest(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              disabled={isDeclining}
              onClick={handleDeclineSubmit}
            >
              {isDeclining ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : "Confirm Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIRECT ISSUANCE MODAL */}
      <Dialog open={isDirectIssueOpen} onOpenChange={(open) => !open && setIsDirectIssueOpen(false)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-neutral-300">
          <div className="bg-neutral-900 text-white p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-vintage-gold mb-1">
              <Plus className="w-3.5 h-3.5" />
              Administrative Card Dispatch
            </div>
            <DialogTitle className="text-xl font-bold font-display text-white">
              Direct Customer Card Issuance
            </DialogTitle>
            <DialogDescription className="text-neutral-400 text-xs mt-0.5">
              Issue a Debit or Credit facility directly to any active customer without an initial application.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Customer Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Select Customer *</label>
              <Select
                value={directForm.userId}
                onValueChange={(val) => {
                  const usr = usersWithAccounts.find((u) => u.id === val);
                  setDirectForm((p) => ({
                    ...p,
                    userId: val,
                    accountId: usr?.accounts[0]?.id || "",
                  }));
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose a registered customer..." />
                </SelectTrigger>
                <SelectContent>
                  {usersWithAccounts.map((usr) => (
                    <SelectItem key={usr.id} value={usr.id}>
                      {usr.firstName} {usr.lastName} ({usr.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Picker */}
            {selectedUserForDirect && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Attach to Vault *</label>
                <Select
                  value={directForm.accountId}
                  onValueChange={(val) => setDirectForm((p) => ({ ...p, accountId: val }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select active depository vault" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUserForDirect.accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountType} (••••{acc.accountNumber.slice(-4)}) — Balance: ${acc.balance.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Facility & Network */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Card Facility</label>
                <Select
                  value={directForm.cardType}
                  onValueChange={(val) => setDirectForm((p) => ({ ...p, cardType: val }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">Debit Card</SelectItem>
                    <SelectItem value="CREDIT">Revolving Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Payment Network</label>
                <Select
                  value={directForm.network}
                  onValueChange={(val) => setDirectForm((p) => ({ ...p, network: val }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISA">VISA</SelectItem>
                    <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tier & Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Card Edition / Tier</label>
                <Select
                  value={directForm.cardTier}
                  onValueChange={(val) => setDirectForm((p) => ({ ...p, cardTier: val }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard Edition</SelectItem>
                    <SelectItem value="GOLD_RESERVE">Gold Reserve</SelectItem>
                    <SelectItem value="ONYX_PLATINUM">Onyx Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Daily Spending Limit ($)</label>
                <Input
                  type="number"
                  value={directForm.dailyLimit}
                  onChange={(e) => setDirectForm((p) => ({ ...p, dailyLimit: Number(e.target.value) }))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Custom Artwork */}
            <div className="space-y-2 pt-2 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-vintage-gold" />
                  Card Artwork Artwork
                </label>
                <span className="text-[10px] text-neutral-400">Choose luxury preset or custom URL</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PRESET_ARTWORKS.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setDirectForm((p) => ({ ...p, cardImageUrl: art.url }))}
                    className={`h-14 rounded-lg p-1.5 flex flex-col justify-end text-white text-[9px] font-bold cursor-pointer transition-all border relative overflow-hidden bg-cover bg-center ${
                      directForm.cardImageUrl === art.url
                        ? "border-vintage-gold ring-2 ring-vintage-gold"
                        : "border-neutral-300 hover:opacity-90"
                    }`}
                    style={{ backgroundImage: `url(${art.url})` }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <span className="relative z-10 leading-tight">{art.name}</span>
                  </div>
                ))}
              </div>

              <Input
                placeholder="Or paste external custom image URL"
                value={directForm.cardImageUrl}
                onChange={(e) => setDirectForm((p) => ({ ...p, cardImageUrl: e.target.value }))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-between">
            <Button variant="ghost" size="small" onClick={() => setIsDirectIssueOpen(false)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="bg-ink-900 hover:bg-ink-800 text-white font-bold"
              disabled={isDirectIssuing}
              onClick={handleDirectIssueSubmit}
            >
              {isDirectIssuing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : "Generate & Dispatch Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT CARD MODAL */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-ink-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-vintage-gold" />
              Edit Card Parameters
            </DialogTitle>
            <DialogDescription className="text-xs">
              Card •••• {editingCard?.cardNumber.slice(-4)} · Customer: {editingCard?.account.user.firstName} {editingCard?.account.user.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Daily Spending Limit ($)</label>
              <Input
                type="number"
                value={editForm.dailyLimit}
                onChange={(e) => setEditForm((p) => ({ ...p, dailyLimit: Number(e.target.value) }))}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Card Tier</label>
              <Select
                value={editForm.cardTier}
                onValueChange={(val) => setEditForm((p) => ({ ...p, cardTier: val }))}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="GOLD_RESERVE">Gold Reserve</SelectItem>
                  <SelectItem value="ONYX_PLATINUM">Onyx Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(val) => setEditForm((p) => ({ ...p, status: val }))}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="FROZEN">Frozen (Blocked)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-200">
              <label className="text-xs font-semibold text-neutral-700 block">Custom Artwork URL</label>
              <Input
                placeholder="https://..."
                value={editForm.cardImageUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, cardImageUrl: e.target.value }))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="ghost" size="small" onClick={() => setEditingCard(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="bg-ink-900 hover:bg-ink-800 text-white font-bold"
              disabled={isEditing}
              onClick={handleEditSubmit}
            >
              {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deletingCard} onOpenChange={(open) => !open && setDeletingCard(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Delete Customer Card
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete card ending in •••• {deletingCard?.cardNumber.slice(-4)}? This action is irreversible and strictly isolates this customer's card.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-between mt-4">
            <Button variant="ghost" size="small" onClick={() => setDeletingCard(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              disabled={isDeleting}
              onClick={handleDeleteSubmit}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : "Permanently Delete Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
