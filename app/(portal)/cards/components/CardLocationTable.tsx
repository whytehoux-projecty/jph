'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";
import { getTransactions } from "@/app/actions/transactions";

export function CardLocationTable() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTransactions({ limit: 5 })
            .then(data => {
                const raw = Array.isArray(data) ? data : [];
                setTransactions(raw.slice(0, 5));
            })
            .catch(() => setTransactions([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <History className="w-4 h-4 text-vintage-green" />
                    Recent Transactions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Merchant</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-14 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : transactions.length > 0 ? (
                            transactions.map((tx) => {
                                const amount = Number(tx.amount ?? 0);
                                const isCredit = tx.type === 'credit' || tx.originalType === 'DEPOSIT' || tx.originalType === 'TRANSFER_IN';
                                const displayAmount = isCredit ? amount : -Math.abs(amount);
                                const date = tx.date || tx.createdAt;
                                return (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-charcoal">
                                                    {tx.description || 'Transaction'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`text-right font-mono text-sm font-semibold ${displayAmount > 0 ? 'text-emerald-600' : 'text-charcoal'}`}>
                                            {displayAmount > 0 ? '+' : ''}{displayAmount.toLocaleString('en-US', { style: 'currency', currency: tx.currency || 'USD' })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={tx.status === 'PENDING' ? 'warning' : 'success'}
                                                className="text-[10px]">
                                                {tx.status === 'PENDING' ? 'Pending' : 'Complete'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-16 text-center text-muted-foreground text-sm">
                                    No recent transactions.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
