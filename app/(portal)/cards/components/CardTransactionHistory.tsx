'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag, Coffee, Plane, Car, FileText, Wallet, Download, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTransactions, disputeTransaction } from "@/app/actions/transactions";
import { toast } from '@/lib/toast';

const CATEGORY_MAP: Record<string, { icon: any; color: string }> = {
    Shopping:  { icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    Dining:    { icon: Coffee,      color: 'text-orange-600 bg-orange-50' },
    Travel:    { icon: Plane,       color: 'text-purple-600 bg-purple-50' },
    Transport: { icon: Car,         color: 'text-emerald-600 bg-emerald-50' },
    Utilities: { icon: FileText,    color: 'text-slate-600 bg-slate-50' },
    General:   { icon: Wallet,      color: 'text-gray-500 bg-gray-50' },
};

function getCategoryMeta(category: string) {
    return CATEGORY_MAP[category] ?? CATEGORY_MAP['General'];
}

function mapTransaction(tx: any) {
    const meta = getCategoryMeta(tx.category || 'General');
    const amount = Number(tx.amount ?? 0);
    const isCredit = tx.type === 'credit' || tx.originalType === 'DEPOSIT' || tx.originalType === 'TRANSFER_IN';
    return {
        id: tx.id,
        merchant: tx.description || tx.merchant || 'Unknown',
        date: tx.date || tx.createdAt,
        amount: isCredit ? amount : -Math.abs(amount),
        category: { name: tx.category || 'General', ...meta },
        status: tx.status === 'PENDING' ? 'Pending' : 'Completed',
        currency: tx.currency || 'USD',
    };
}

function isWithinPeriod(dateStr: string, period: string): boolean {
    const date = new Date(dateStr);
    const now = new Date();
    if (period === 'week') {
        const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        return date >= weekAgo;
    }
    if (period === 'month') {
        return date >= new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (period === 'year') {
        return date >= new Date(now.getFullYear(), 0, 1);
    }
    return true; // 'all'
}

function exportToCSV(transactions: any[]) {
    const header = ['Date', 'Merchant', 'Category', 'Amount', 'Status'];
    const rows = transactions.map(tx => [
        new Date(tx.date).toLocaleDateString('en-US'),
        `"${tx.merchant}"`,
        tx.category.name,
        tx.amount.toFixed(2),
        tx.status,
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

type TimePeriod = 'all' | 'week' | 'month' | 'year';

const PERIOD_LABELS: { value: TimePeriod; label: string }[] = [
    { value: 'all',   label: 'All Time' },
    { value: 'week',  label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year',  label: 'This Year' },
];

export function CardTransactionHistory({ cardId }: { cardId: string }) {
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [period, setPeriod] = useState<TimePeriod>('month');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [disputingId, setDisputingId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getTransactions({ limit: 100 })
            .then(data => {
                const raw = Array.isArray(data) ? data : [];
                setAllTransactions(raw.map(mapTransaction));
            })
            .catch(() => setAllTransactions([]))
            .finally(() => setLoading(false));
    }, [cardId]);

    const filteredTransactions = allTransactions.filter(tx => {
        const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())
            || tx.category.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPeriod = isWithinPeriod(tx.date, period);
        return matchesSearch && matchesPeriod;
    });

    const handleDispute = useCallback(async (txId: string) => {
        setDisputingId(txId);
        try {
            await disputeTransaction(txId, { reason: 'Disputed via Cards Center' });
            toast.success({ title: 'Dispute filed', description: 'We\'ll investigate and contact you within 3 business days.' });
            setExpandedId(null);
        } catch {
            toast.error({ title: 'Could not file dispute', description: 'Please call support or try again.' });
        } finally {
            setDisputingId(null);
        }
    }, []);

    const handleExport = () => {
        if (filteredTransactions.length === 0) {
            toast.warn({ title: 'No transactions to export' });
            return;
        }
        exportToCSV(filteredTransactions);
        toast.success({ title: 'CSV exported', description: `${filteredTransactions.length} transactions downloaded.` });
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>
                                {loading ? 'Loading…' : `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''}`}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={handleExport}
                            icon={<Download className="w-3.5 h-3.5" />}
                            className="shrink-0"
                        >
                            Export CSV
                        </Button>
                    </div>

                    {/* Time Period Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {PERIOD_LABELS.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setPeriod(value)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                                    period === value
                                        ? "bg-vintage-green text-white border-vintage-green shadow-sm"
                                        : "bg-white text-muted-foreground border-border hover:border-vintage-green/40 hover:text-charcoal"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                        <div className="ml-auto">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search…"
                                    className="pl-8 h-7 text-xs w-40"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <div className="max-h-[480px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-white/97 backdrop-blur-sm z-10">
                            <TableRow>
                                <TableHead className="w-[42px]" />
                                <TableHead>Merchant</TableHead>
                                <TableHead className="hidden sm:table-cell">Date</TableHead>
                                <TableHead className="hidden md:table-cell">Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[28px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-14 bg-gray-100 rounded animate-pulse ml-auto" /></TableCell>
                                        <TableCell />
                                    </TableRow>
                                ))
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => {
                                    const Icon = tx.category.icon;
                                    const isExpanded = expandedId === tx.id;
                                    return (
                                        <>
                                            <TableRow
                                                key={tx.id}
                                                className={cn(
                                                    "group cursor-pointer transition-colors",
                                                    isExpanded ? "bg-muted/40" : "hover:bg-gray-50/60"
                                                )}
                                                onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                                            >
                                                <TableCell>
                                                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", tx.category.color)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-charcoal text-sm">{tx.merchant}</div>
                                                    {tx.status === 'Pending' && (
                                                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Pending</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                                                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="secondary" className="font-normal text-[10px] bg-gray-100 text-gray-600 border-0">
                                                        {tx.category.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold font-mono text-sm">
                                                    <span className={tx.amount > 0 ? 'text-emerald-600' : 'text-charcoal'}>
                                                        {tx.amount > 0 ? '+' : ''}
                                                        {tx.amount.toLocaleString('en-US', { style: 'currency', currency: tx.currency })}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-muted-foreground group-hover:text-charcoal transition-colors">
                                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow key={`${tx.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                                                    <TableCell colSpan={6} className="py-3 px-6">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="text-xs text-muted-foreground space-y-0.5">
                                                                <p>
                                                                    <span className="font-medium text-charcoal">Full date:</span>{' '}
                                                                    {new Date(tx.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium text-charcoal">Status:</span>{' '}
                                                                    {tx.status}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="small"
                                                                icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                                                                className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 shrink-0"
                                                                disabled={disputingId === tx.id}
                                                                onClick={(e) => { e.stopPropagation(); handleDispute(tx.id); }}
                                                            >
                                                                {disputingId === tx.id ? 'Filing…' : 'Dispute'}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
