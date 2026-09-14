"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const regions = [
    { value: "usa", label: "USA" },
    { value: "canada", label: "Canada" },
    { value: "east-asia", label: "East Asia (CN, JP, KR)" },
    { value: "west-africa", label: "West Africa (NG, GH, SN)" },
    { value: "central-europe", label: "Central Europe (EU)" },
    { value: "germany", label: "Germany" },
    { value: "france", label: "France" },
    { value: "uk", label: "United Kingdom" },
    { value: "italy", label: "Italy" },
    { value: "spain", label: "Spain" },
    { value: "switzerland", label: "Switzerland" },
    { value: "belgium", label: "Belgium" },
]

interface CountrySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12 text-left font-normal"
                >
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        {value
                            ? regions.find((region) => region.value === value)?.label
                            : "Select Region or Country..."}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No region found.</CommandEmpty>
                        <CommandGroup heading="Regions & Countries">
                            {regions.map((region) => (
                                <CommandItem
                                    key={region.value}
                                    value={region.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === region.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {region.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
