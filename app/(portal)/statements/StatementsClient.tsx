'use client';


import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import {
    Download,
    FileText,
    Calendar,
    Filter,
    RefreshCw,
    Search
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { VintageIcon } from '@/components/ui/vintage-icon';

export default function StatementsClient({ initialStatements, initialAccounts }: { initialStatements: any[], initialAccounts: any[] }) {
    const [statements, setStatements] = useState<any[]>(initialStatements);
    const [accounts, setAccounts] = useState<any[]>(initialAccounts);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        // Data is loaded via Server Component props
    }, []);

    const fetchStatements = async () => {
        // Handle mock fetching if needed
    };

    const handleDownload = async (id: string, filename: string) => {
        // Mock download if API might fail
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const blob = new Blob(["Simulated PDF Content"], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed', error);
            toast.error({ title: 'Download failed', description: 'Please try again.' });
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            if (accounts.length === 0) {
                toast.warn({ title: 'No accounts found', description: 'Open an account before generating statements.' });
                return;
            }

            toast.info({ title: 'Statement generation is being upgraded.', description: 'Please try again shortly.' });
            // fetchStatements(); // Refresh list
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vintage-green"></div>
                <div className="text-muted-foreground animate-pulse">Retrieving archived statements...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4 animate-fade-in-up">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-charcoal">Account Statements</h1>
                    <p className="text-muted-foreground mt-1">Access your monthly financial records securely.</p>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    variant="primary"
                    icon={generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                >
                    {generating ? 'Processing...' : 'Generate New Statement'}
                </Button>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium">Document History</CardTitle>
                        <CardDescription>All generated statements for the past 12 months</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Period</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Generated Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 opacity-20" />
                                            <span>No statements available.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                statements.map((statement) => (
                                    <TableRow key={statement.id} className="group">
                                        <TableCell className="pl-6 font-medium">
                                            <div className="flex items-center gap-3">
                                                <VintageIcon variant="green" size="sm" icon={FileText} className="opacity-80" />
                                                <span>
                                                    {new Date(statement.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-charcoal">{statement.account.accountType}</span>
                                                <span className="text-xs text-muted-foreground font-mono">****{statement.account.accountNumber.slice(-4)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(statement.generatedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statement.statementType === 'MONTHLY' ? 'default' : 'secondary'} className="text-[10px]">
                                                {statement.statementType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                onClick={() => handleDownload(statement.id, `Statement-${new Date(statement.periodStart).toISOString().slice(0, 7)}.pdf`)}
                                                className="text-muted-foreground hover:text-vintage-green h-8 w-8 p-0"
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function PlusIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
