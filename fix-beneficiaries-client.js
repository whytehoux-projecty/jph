const fs = require('fs');

// 1. Rewrite BeneficiariesClient.tsx
let clientCode = fs.readFileSync('app/(portal)/beneficiaries/BeneficiariesClient.tsx', 'utf8');

const clientInterfaceReplace = `import { beneficiaryRails } from '@/lib/beneficiary-rails';
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
}`;
clientCode = clientCode.replace(/interface Beneficiary \{[\s\S]*?\}/, clientInterfaceReplace);

// Remove the old form state
clientCode = clientCode.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/, `
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
`);

// Update handleAddBeneficiary to onSubmit
const handleAddReplace = `    const handleSubmit = async (data: any) => {
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
    };`;
clientCode = clientCode.replace(/const handleAddBeneficiary = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/, handleAddReplace);

const filteredReplace = `    const filteredBeneficiaries = beneficiaries.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())
    );`;
clientCode = clientCode.replace(/const filteredBeneficiaries = beneficiaries\.filter[\s\S]*?\);/, filteredReplace);

const formUIReplace = `<DialogContent className="sm:max-w-[600px]">
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
                    </DialogContent>`;
clientCode = clientCode.replace(/<DialogContent className="sm:max-w-\[600px\]">[\s\S]*?<\/DialogContent>/, formUIReplace);

// Update Add button to clear edit state
clientCode = clientCode.replace(/<DialogTrigger asChild>/, `<DialogTrigger asChild onClick={() => setEditingId(null)}>`);

// Replace the card content mapping
const cardMappingReplace = `{filteredBeneficiaries.map((beneficiary) => {
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
                                        <AvatarFallback className="bg-vintage-green/10 text-vintage-green font-bold text-lg">
                                            {beneficiary.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-charcoal">{beneficiary.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{beneficiary.nickname || rail?.displayName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-[color:var(--heritage-navy)] flex items-center justify-center"
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
                                        <span className="font-medium text-charcoal">{rail?.displayName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <CreditCard className="w-4 h-4" /> Identifier
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-charcoal bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-xs">
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
                                    <Link href={\`/transfer?beneficiaryId=\${beneficiary.id}\`}>
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
                    )})}`;
clientCode = clientCode.replace(/\{filteredBeneficiaries\.map\(\(beneficiary\) => \([\s\S]*?<\/Card>\s*\)\)\}/, cardMappingReplace);

fs.writeFileSync('app/(portal)/beneficiaries/BeneficiariesClient.tsx', clientCode);
console.log('BeneficiariesClient updated.');
