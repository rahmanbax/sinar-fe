"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ColumnConfig } from "./SinarParameterizedTable"

export type Option = {
    label: string
    value: string
    category?: string
}

interface MultiSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    options: Option[]
    selected: Option[]
    onChange: (opt: Option[]) => void
    placeholder?: string
}


export const colToOptions = (columns: ColumnConfig) : {label: string, value: string}[] => {
    return Object.entries(columns).map(([key, val]) => ({ label: val.label, value: key}))
} 

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    ...props
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleUnselect = (option: Option) => {
        onChange(selected.filter((item) => item.value !== option.value))
    }

    const groupedOptions = options.reduce(
        (acc, option) => {
            const category = option.category
            if (category) {
                if (!acc[category]) {
                    acc[category] = []
                }
                acc[category].push(option)   
            }
            return acc
        },
        {} as Record<string, Option[]>,
    )

    return (
        <div {...props}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        <div className="flex gap-1 overflow-hidden max-h-10 items-center">
                            { selected.length === options.length ?  <span className="text-muted-foreground">Semua</span> : (
                                selected.map((option) => (
                                    <Badge key={option.value} variant="secondary" className="mr-1 mb-1">
                                        {option.label}
                                       { option.value !== 'id' && <div
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(option)
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                            onClick={() => handleUnselect(option)}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </div>}
                                    </Badge>
                                ))
                            )}
                        </div>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search..." />
                        <CommandList>
                            <CommandEmpty>No item found.</CommandEmpty>
                            <CommandItem
                                    onSelect={() => {
                                        onChange([...options])
                                    }}
                                >
                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                    Semua
                                </CommandItem>
                            {Object.entries(groupedOptions).length > 1 && Object.entries(groupedOptions).map(([category, categoryOptions], index) => (
                                <React.Fragment key={category}>
                                    {index > 0 && <CommandSeparator />}
                                    <CommandGroup heading={category}>
                                        {categoryOptions.map((option) => {
                                            const isSelected = selected.some((item) => item.value === option.value)
                                            return (
                                                <CommandItem
                                                    key={option.value}
                                                    onSelect={() => {
                                                        onChange(
                                                            isSelected ? selected.filter((item) => item.value !== option.value) : [...selected, option],
                                                        )
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                                    {option.label}
                                                </CommandItem>
                                            )
                                        })}
                                    </CommandGroup>
                                </React.Fragment>
                            ))}
                            {Object.entries(groupedOptions).length < 2 && options.filter(o => o.value !== 'id').map((option) => {
                                            const isSelected = selected.some((item) => item.value === option.value)
                                            return (
                                                <CommandItem
                                                    key={option.value}
                                                    onSelect={() => {
                                                        onChange(
                                                            isSelected ? selected.filter((item) => item.value !== option.value) : [...selected, option],
                                                        )
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                                    {option.label}
                                                </CommandItem>
                                            )
                                        })}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

