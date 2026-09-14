"use client"

import { Zap, Tv, Wifi, Shield, Smartphone, CreditCard, Droplet, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { VintageIcon } from "@/components/ui/vintage-icon"

const categories = [
    { id: 'UTILITIES', label: 'Electricity & Gas', icon: Zap, color: 'text-amber-500' },
    { id: 'INTERNET', label: 'Internet', icon: Wifi, color: 'text-blue-500' },
    { id: 'TV', label: 'TV Subscription', icon: Tv, color: 'text-purple-500' },
    { id: 'INSURANCE', label: 'Insurance', icon: Shield, color: 'text-green-600' },
    { id: 'MOBILE', label: 'Mobile Top-up', icon: Smartphone, color: 'text-slate-600' },
    { id: 'WATER', label: 'Water Bill', icon: Droplet, color: 'text-cyan-500' },
    { id: 'EDUCATION', label: 'Tuition Fees', icon: GraduationCap, color: 'text-indigo-600' },
    { id: 'CREDIT', label: 'Credit Card Repayment', icon: CreditCard, color: 'text-red-500' },
]

interface ServiceCategoryGridProps {
    value: string;
    onChange: (value: string) => void;
}

export function ServiceCategoryGrid({ value, onChange }: ServiceCategoryGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
                <div
                    key={cat.id}
                    onClick={() => onChange(cat.id)}
                    className={cn(
                        "cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md",
                        value === cat.id
                            ? "bg-vintage-green/5 border-vintage-green ring-1 ring-vintage-green"
                            : "bg-white border-border hover:border-vintage-green/30"
                    )}
                >
                    <div className={cn("p-2 rounded-full bg-opacity-10", value === cat.id ? "bg-vintage-green bg-opacity-10" : "bg-gray-100")}>
                        <cat.icon className={cn("w-6 h-6", cat.color)} />
                    </div>
                    <span className="text-sm font-medium text-center text-charcoal">{cat.label}</span>
                </div>
            ))}
        </div>
    )
}
