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

interface Beneficiary {
    id: string;
    name: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    nickname?: string;
    email?: string;
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
    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        bankName: '',
        swiftCode: '',
        nickname: '',
        email: '',
    });

    useEffect(() => {
        // Data is loaded via Server Component props
    }, []);

    const loadBeneficiaries = async () => {
        router.refresh();
    };

    const handleAddBeneficiary = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const newBeneficiary = await createBeneficiary({
                name: formData.name,
                accountNumber: formData.accountNumber,
                bankName: formData.bankName,
                swiftCode: formData.swiftCode,
            });
            // Update local state and refresh router to keep everything in sync
            setBeneficiaries(prev => [newBeneficiary as Beneficiary, ...prev]);
            router.refresh();
            setIsDialogOpen(false);
            setFormData({
                name: '',
                accountNumber: '',
                bankName: '',
                swiftCode: '',
                nickname: '',
                email: '',
            });
        } catch (err: any) {
            console.error('Failed to add beneficiary:', err);
            toast.error({ title: 'Failed to add beneficiary', description: err?.message });
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
        b.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bankName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-charcoal">Beneficiaries</h1>
                    <p className="text-muted-foreground mt-1">Manage trusted contacts for faster transfers.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                            Add Beneficiary
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Beneficiary</DialogTitle>
                            <DialogDescription>
                                Enter the banking details for the new recipient.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddBeneficiary}>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            placeholder="e.g. John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nickname (Optional)</Label>
                                        <Input
                                            placeholder="e.g. Family"
                                            value={formData.nickname}
                                            onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Account Number / IBAN</Label>
                                    <Input
                                        placeholder="Enter account number"
                                        value={formData.accountNumber}
                                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                        required
                                        className="font-mono"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bank Name</Label>
                                        <Input
                                            placeholder="e.g. Chase Bank"
                                            value={formData.bankName}
                                            onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SWIFT / BIC</Label>
                                        <Input
                                            placeholder="Optional for domestic"
                                            value={formData.swiftCode}
                                            onChange={e => setFormData({ ...formData, swiftCode: e.target.value })}
                                            className="font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-vintage-green text-white hover:bg-vintage-green-dark">
                                    {isSubmitting ? 'Saving...' : 'Save Beneficiary'}
                                </Button>
                            </DialogFooter>
                        </form>
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
                    {filteredBeneficiaries.map((beneficiary) => (
                        <Card key={beneficiary.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-vintage-gold/50">
                            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-vintage-green/10 text-vintage-green font-bold text-lg">
                                            {beneficiary.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-charcoal">{beneficiary.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{beneficiary.nickname || 'Personal Contact'}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-muted-foreground hover:text-red-600 flex items-center justify-center"
                                    onClick={() => setDeleteTarget(beneficiary.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Building2 className="w-4 h-4" /> Bank
                                        </span>
                                        <span className="font-medium text-charcoal">{beneficiary.bankName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <CreditCard className="w-4 h-4" /> Account
                                        </span>
                                        <span className="font-mono text-charcoal bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                            {beneficiary.accountNumber}
                                        </span>
                                    </div>
                                    {beneficiary.swiftCode && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <Globe className="w-4 h-4" /> Swift
                                            </span>
                                            <span className="font-mono text-charcoal text-xs">
                                                {beneficiary.swiftCode}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-border">
                                    <Badge variant={beneficiary.isInternal ? "success" : "secondary"} className="text-[10px] font-normal px-2">
                                        {beneficiary.isInternal ? "Internal" : "External"}
                                    </Badge>
                                    <Link href={`/transfer?accountNumber=${encodeURIComponent(beneficiary.accountNumber)}&recipientName=${encodeURIComponent(beneficiary.name)}&bankName=${encodeURIComponent(beneficiary.bankName)}`}>
                                        <Button
                                            size="small"
                                            variant="outline"
                                            className="text-xs h-8 ml-auto hover:bg-vintage-green hover:text-white hover:border-vintage-green transition-colors gap-1"
                                        >
                                            Transfer <Send className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-charcoal">No beneficiaries found</h3>
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
