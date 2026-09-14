import { cn } from "@/lib/utils"
import { Wifi, Snowflake } from 'lucide-react'

interface VisualCardProps {
    name: string;
    number: string;
    expiry: string;
    cvc: string;
    type: 'gold' | 'platinum' | 'metal' | 'standard' | 'credit' | 'debit' | string;
    scheme?: string;
    frozen?: boolean;
    className?: string;
    flipped?: boolean;
    onFlip?: () => void;
}

export function VisualCard({ name, number, expiry, cvc, type, scheme, frozen = false, className, flipped = false, onFlip }: VisualCardProps) {

    const getBackground = (type: string) => {
        switch (type) {
            case 'gold': return 'bg-gradient-to-br from-[#D4AF7A] via-[#E5C596] to-[#B8941F] border-[#F9F7F4]/20';
            case 'platinum': return 'bg-gradient-to-br from-[#E5E4E2] via-[#F4F4F4] to-[#B0B0B0] border-white/30';
            case 'metal':
            case 'credit': return 'bg-gradient-to-br from-[#2C2C2C] via-[#4A4A4A] to-[#1A1A1A] border-white/10 text-white';
            case 'standard':
            case 'debit': return 'bg-gradient-to-br from-vintage-green to-vintage-green-dark border-white/20 text-white';
            default: return 'bg-gradient-to-br from-vintage-green to-vintage-green-dark border-white/20 text-white';
        }
    }

    const getTextColor = (type: string) => {
        switch (type) {
            case 'gold': return 'text-[#3D3D3D]';
            case 'platinum': return 'text-[#3D3D3D]';
            default: return 'text-white';
        }
    }

    const schemeLabel = scheme === 'mastercard' ? 'Mastercard' : 'VISA';
    const isMastercard = scheme === 'mastercard';

    // Format number to chunks of 4
    const formattedNumber = number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();

    return (
        <div
            className={cn(
                "perspective-1000 cursor-pointer transition-all duration-500",
                frozen ? "saturate-0 brightness-90" : "",
                className
            )}
            onClick={onFlip}
        >
            <div className={cn(
                "relative w-full aspect-[1.586/1] transition-all duration-700 [transform-style:preserve-3d]",
                flipped ? "[transform:rotateY(180deg)]" : ""
            )}>
                {/* Frozen overlay */}
                {frozen && !flipped && (
                    <div className="absolute inset-0 rounded-2xl z-20 bg-slate-300/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 pointer-events-none">
                        <div className="bg-white/80 rounded-full p-3 shadow-lg">
                            <Snowflake className="w-8 h-8 text-blue-400" />
                        </div>
                        <span className="text-white text-xs font-bold tracking-[0.2em] uppercase drop-shadow-md bg-black/30 px-3 py-1 rounded-full">Card Frozen</span>
                    </div>
                )}
                {/* Front Face */}
                <div className={cn(
                    "absolute w-full h-full rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden border [backface-visibility:hidden]",
                    getBackground(type),
                    getTextColor(type)
                )}>
                    {/* Glossy Overlay Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />

                    {/* Header: Chip and Contactless */}
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="w-12 h-9 bg-yellow-200/40 rounded-md border border-yellow-400/30 flex items-center justify-center overflow-hidden">
                            {/* Chip Detail simulation */}
                            <div className="w-full h-[1px] bg-yellow-600/20 absolute top-1/2" />
                            <div className="h-full w-[1px] bg-yellow-600/20 absolute left-1/3" />
                            <div className="h-full w-[1px] bg-yellow-600/20 absolute right-1/3" />
                        </div>
                        <Wifi className="w-6 h-6 opacity-80 rotate-90" />
                    </div>

                    {/* Card Number */}
                    <div className="relative z-10 mt-4">
                        <p className="text-xl md:text-2xl font-mono tracking-widest drop-shadow-sm font-semibold">
                            {formattedNumber}
                        </p>
                    </div>

                    {/* Footer: Details and Logo */}
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-[10px] uppercase opacity-75 tracking-wider">Card Holder</p>
                                    <p className="font-medium tracking-wide uppercase font-mono text-sm shadow-black/10">{name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase opacity-75 tracking-wider">Expires</p>
                                    <p className="font-medium tracking-wide font-mono text-sm">{expiry}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            {isMastercard ? (
                                <div className="flex items-center -space-x-2">
                                    <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
                                    <div className="w-7 h-7 rounded-full bg-orange-400 opacity-90" />
                                </div>
                            ) : (
                                <div className="font-bold italic text-lg opacity-90">{schemeLabel}</div>
                            )}
                            <div className="text-[8px] uppercase tracking-widest opacity-60">Infinite</div>
                        </div>
                    </div>
                </div>

                {/* Back Face */}
                <div className={cn(
                    "absolute w-full h-full rounded-2xl shadow-2xl overflow-hidden border [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    getBackground(type),
                    getTextColor(type)
                )}>
                    {/* Magnetic Strip */}
                    <div className="w-full h-12 bg-black mt-6 opacity-90" />

                    {/* Signature & CVV Area */}
                    <div className="px-6 mt-6 flex gap-4 items-center">
                        <div className="flex-1 h-10 bg-white/40 rounded flex items-center px-2">
                            <div className="w-full h-6 bg-white/60 transform -skew-x-12" />
                        </div>
                        <div className="bg-white text-black font-mono font-bold px-3 py-2 rounded shadow-inner text-lg">
                            {cvc}
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 text-[10px] opacity-70 max-w-[70%] leading-tight">
                        This card is property of JP Heritage Bank. If found, please return to any branch or call 1-800-HERITAGE.
                    </div>

                    <div className="absolute bottom-6 right-6">
                        {isMastercard ? (
                            <div className="flex items-center -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-red-500 opacity-80" />
                                <div className="w-6 h-6 rounded-full bg-orange-400 opacity-80" />
                            </div>
                        ) : (
                            <div className="font-bold italic text-lg opacity-90">{schemeLabel}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
