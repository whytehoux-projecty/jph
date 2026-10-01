'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBeneficiary, deleteBeneficiary } from '@/app/actions/beneficiaries';
import { toast } from '@/lib/toast';
import {
    Plus,
    Trash2,
    Search,
    User,
    Building2,
    CreditCard,
    Globe,
    Send,
    MoreHorizontal,
    Briefcase
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { VintageIcon } from '@/components/ui/vintage-icon';

import { beneficiaryRails } from '@/lib/beneficiary-rails';
import { DynamicBeneficiaryForm } from '@/components/beneficiaries/DynamicBeneficiaryForm';
import { updateBeneficiary } from '@/app/actions/beneficiaries';
import { Eye, EyeOff, Edit2 } from 'lucide-react';

interface Beneficiary {
    id: string;
    name: string;
    nickname?: string;
    rail: string;
    details: string;
    status: string;
    isInternal: boolean;
}

export default function BeneficiariesClient({ initialBeneficiaries }: { initialBeneficiaries: Beneficiary[] }) {
    const router = useRouter();
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    // New Beneficiary Form State
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

    const toggleReveal = (id: string) => {
        setRevealedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };


    useEffect(() => {
        // Data is loaded via Server Component props
    }, []);

    const loadBeneficiaries = async () => {
        router.refresh();
    };

        const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (editingId) {
                const updated = await updateBeneficiary(editingId, data);
                setBeneficiaries(prev => prev.map(b => b.id === editingId ? updated as Beneficiary : b));
                toast.success({ title: 'Beneficiary updated' });
            } else {
                const newBeneficiary = await createBeneficiary(data);
                setBeneficiaries(prev => [newBeneficiary as Beneficiary, ...prev]);
                toast.success({ title: 'Beneficiary created' });
            }
            router.refresh();
            setIsDialogOpen(false);
            setEditingId(null);
        } catch (err: any) {
            console.error('Failed to save beneficiary:', err);
            toast.error({ title: 'Failed to save', description: err?.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteBeneficiary(deleteTarget);
            setBeneficiaries(prev => prev.filter(b => b.id !== deleteTarget));
            router.refresh();
            toast.success({ title: 'Beneficiary removed.' });
        } catch {
            toast.error({ title: 'Failed to remove beneficiary.' });
        } finally {
            setDeleteTarget(null);
        }
    };

        const filteredBeneficiaries = beneficiaries.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-ink-900">Beneficiaries</h1>
                    <p className="text-muted-foreground mt-1">Manage trusted contacts for faster transfers.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild onClick={() => setEditingId(null)}>
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                            Add Beneficiary
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Beneficiary' : 'Add New Beneficiary'}</DialogTitle>
                            <DialogDescription>
                                {editingId ? 'Update the details for this recipient.' : 'Enter the banking details for the new recipient.'}
                            </DialogDescription>
                        </DialogHeader>
                        <DynamicBeneficiaryForm 
                            initialData={editingId ? beneficiaries.find(b => b.id === editingId) : undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => { setIsDialogOpen(false); setEditingId(null); }}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, bank, or nickname..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : filteredBeneficiaries.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBeneficiaries.map((beneficiary) => {
                        const rail = beneficiaryRails[beneficiary.rail || 'us_bank'];
                        const details = JSON.parse(beneficiary.details || '{}');
                        const displayAccount = rail ? rail.getDisplayAccount(details) : 'Unknown';
                        const isRevealed = revealedIds.has(beneficiary.id);
                        
                        // Simple masking logic
                        const maskedAccount = displayAccount.replace(/[a-zA-Z0-9](?=.*[a-zA-Z0-9]{4})/g, '•');

                        return (
                        <Card key={beneficiary.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-vintage-gold/50">
                            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-pine-700/10 text-pine-700 font-bold text-lg">
                                            {beneficiary.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-ink-900">{beneficiary.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{beneficiary.nickname || rail?.displayName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-ink-900 flex items-center justify-center"
                                        onClick={() => { setEditingId(beneficiary.id); setIsDialogOpen(true); }}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 flex items-center justify-center"
                                        onClick={() => setDeleteTarget(beneficiary.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Globe className="w-4 h-4" /> Method
                                        </span>
                                        <span className="font-medium text-ink-900">{rail?.displayName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <CreditCard className="w-4 h-4" /> Identifier
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-ink-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-xs">
                                                {isRevealed ? displayAccount : maskedAccount}
                                            </span>
                                            <button onClick={() => toggleReveal(beneficiary.id)} className="text-muted-foreground hover:text-slate-900 transition-colors">
                                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-border">
                                    <Badge variant={beneficiary.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px] font-normal px-2">
                                        {beneficiary.status}
                                    </Badge>
                                    <Link href={`/transfer?beneficiaryId=${beneficiary.id}`}>
                                        <Button
                                            size="small"
                                            variant="outline"
                                            className="text-xs h-8 ml-auto hover:bg-pine-700 hover:text-white hover:border-pine-700 transition-colors gap-1"
                                        >
                                            Transfer <Send className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )})}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-ink-900">No beneficiaries found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                        Add people or businesses you frequently transfer money to.
                    </p>
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        Create First Beneficiary
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Remove Beneficiary</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this beneficiary? You can add them again later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button
                            onClick={confirmDelete}
                            className="bg-red-600 text-white hover:bg-red-700">
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
