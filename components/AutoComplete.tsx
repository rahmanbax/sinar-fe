"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "./ui/label"

interface IAutoComplete {
    label: string
    placeholder: string
    emptyInfo?: string
    data: { id: string | number, value: string | number }[]
    loading?: boolean
    value: string | number
    onSelect: (v: string | number) => void
}

const AutoComplete: React.FC<IAutoComplete> = ({ label, placeholder, emptyInfo, data, value, onSelect, loading }) => {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Label className="mb-3">{label}</Label>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {data.find(d => d.id === value)?.id ?? placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search framework..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>{emptyInfo ?? 'No Data'}</CommandEmpty>
                        <CommandGroup>
                            {data.map((data) => (
                                <CommandItem
                                    key={data.id}
                                    value={data.id?.toString()}
                                    onSelect={(currentValue) => {
                                        onSelect(currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {data.value}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === data.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default AutoComplete;