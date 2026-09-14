'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Lock, ShoppingBag, RefreshCw, Clock, Trash2, CreditCard } from 'lucide-react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface VirtualCard {
    id: string;
    type: 'single-use' | 'merchant-locked' | 'subscription' | 'burner';
    typeName: string;
    last4: string;
    expiryDate: string;
    status: 'active' | 'inactive';
    amountUsed: number;
    limit?: number;
    icon: any;
    color: string;
}

const CARD_TYPES = [
    {
        type: 'single-use',
        icon: Lock,
        title: 'Single-Use Card',
        description: 'Use once for a specific purchase, then expires',
        color: 'text-red-500 bg-red-50',
        borderColor: 'border-red-200'
    },
    {
        type: 'merchant-locked',
        icon: ShoppingBag,
        title: 'Merchant-Locked Card',
        description: 'Only works at a specific merchant',
        color: 'text-blue-500 bg-blue-50',
        borderColor: 'border-blue-200'
    },
    {
        type: 'subscription',
        icon: RefreshCw,
        title: 'Subscription Card',
        description: 'For recurring payments with spending limits',
        color: 'text-purple-500 bg-purple-50',
        borderColor: 'border-purple-200'
    },
    {
        type: 'burner',
        icon: Clock,
        title: 'Temporary Card',
        description: 'Expires after a set time period (e.g., 24h)',
        color: 'text-amber-500 bg-amber-50',
        borderColor: 'border-amber-200'
    }
] as const;

export function VirtualCardGenerator({ physicalCardId }: { physicalCardId: string }) {
    const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [open, setOpen] = useState(false);

    const createVirtualCard = (_typeKey: string) => {
        // Virtual card backend integration coming soon
        setOpen(false);
        toast.info({
            title: 'Virtual Cards Coming Soon',
            description: "This feature is in active development. You'll be notified when it launches.",
        });
    };

    const deleteCard = (id: string) => {
        setVirtualCards(prev => prev.filter(c => c.id !== id));
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-vintage-green" />
                            Virtual Cards
                            <Badge variant="outline" className="text-[10px] font-normal">Beta Preview</Badge>
                        </CardTitle>
                        <CardDescription>Create secure virtual cards for online use.</CardDescription>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="primary" size="small" icon={<Plus className="w-4 h-4" />}>
                                Create
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create Virtual Card</DialogTitle>
                                <DialogDescription>
                                    Select a card type to generate instantly.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                {CARD_TYPES.map((type) => (
                                    <div 
                                        key={type.type}
                                        onClick={() => !isCreating && createVirtualCard(type.type)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md hover:border-vintage-green/50 flex flex-col gap-3 group",
                                            isCreating ? "opacity-50 pointer-events-none" : ""
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors group-hover:bg-white", type.color)}>
                                            <type.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-charcoal">{type.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {virtualCards.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <CreditCard className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-charcoal">No Virtual Cards</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                                Generate a virtual card to protect your real card details online.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {virtualCards.map((card) => (
                                <div 
                                    key={card.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", card.color)}>
                                            <card.icon size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-charcoal text-sm">{card.typeName}</p>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                                                    Active
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="font-mono text-xs text-charcoal font-semibold">•••• {card.last4}</p>
                                                <span className="text-gray-300 text-[10px]">•</span>
                                                <p className="text-xs text-muted-foreground">Expires {card.expiryDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-muted-foreground">Spent</p>
                                            <p className="text-sm font-medium text-charcoal">${card.amountUsed.toFixed(2)}</p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                            onClick={() => deleteCard(card.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
