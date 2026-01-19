/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Input } from "./ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";

type Props<
  T extends Record<string, any>,
  K extends keyof T,
  L extends keyof T
> = {
  valueField: K
  labelField: L
  selectedValue?: T[K]
  onSelectedValueChange: (value: T[K]) => void
  searchValue: string
  onSearchValueChange: (value: string) => void
  items: T[]
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode
  isLoading?: boolean
  emptyMessage?: string
  placeholder?: string
  clearOnSelect?: boolean
}


const AutoComplete = <
  T extends Record<string, any>,
  K extends keyof T,
  L extends keyof T
>({
  valueField,
  labelField,
  selectedValue,
  onSelectedValueChange,
  searchValue,
  onSearchValueChange,
  items,
  renderItem,
  isLoading,
  emptyMessage,
  placeholder,
  clearOnSelect = false
}: Props<T, K, L>) => {

  const [open, setOpen] = useState(false)

  const labels = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[String(item[valueField])] = String(item[labelField])
      return acc
    }, {} as Record<string, string>)
  }, [items, valueField, labelField])

  const reset = () => {
    onSelectedValueChange(undefined as T[K]) // or keep last value if preferred
    onSearchValueChange("")
  }

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      !e.relatedTarget?.hasAttribute("cmdk-list") &&
      labels[String(selectedValue)] !== searchValue
    ) {
      reset()
    }
  }

  const onSelectItem = (inputValue: string) => {
    const selectedItem = items.find(
      item => String(item[valueField]) === inputValue
    )

    if (!selectedItem) {
      reset()
      return
    }

    const newValue = selectedItem[valueField]

    if (newValue === selectedValue) {
      reset()
    } else {
      onSelectedValueChange(newValue)
      if (clearOnSelect) {
        onSearchValueChange("")
      } else {
        onSearchValueChange(String(selectedItem[labelField]))
      }
    }

    setOpen(false)
  }

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false} className="w-full">
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={onSearchValueChange}
              onKeyDown={(e) => setOpen(e.key !== "Escape")}
              onMouseDown={() => setOpen((open) => !!searchValue || !open)}
              onFocus={() => setOpen(true)}
            // onBlur={onInputBlur}
            >
              <Input placeholder={placeholder} value={searchValue} />
            </CommandPrimitive.Input>
          </PopoverAnchor>

          {!open && <CommandList aria-hidden="true" className="hidden" />}

          <PopoverContent
            align="start"
            className="min-w-[--radix-popover-trigger-width] p-0"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (e.target instanceof Element && e.target.hasAttribute("cmdk-input")) {
                e.preventDefault()
              }
            }}
          >
            <CommandList className="w-full">
              {isLoading && (
                <CommandPrimitive.Loading className="w-full">
                  <div className="p-2 w-full flex justify-center">
                    <Spinner />
                  </div>
                </CommandPrimitive.Loading>
              )}

              {!isLoading && items.length > 0 && (
                <CommandGroup>
                  {items.map(item => {
                    const value = String(item[valueField])
                    const isSelected = selectedValue === item[valueField]
                    const label = labels[value]

                    return (
                      <CommandItem
                        key={value}
                        value={value}
                        onMouseDown={(e) => e.preventDefault()}
                        onSelect={onSelectItem}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">

                          {/* ✅ Custom renderer if provided */}
                          {renderItem
                            ? renderItem(item, isSelected)
                            : <span>{label}</span>
                          }

                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {!isLoading && (
                <CommandEmpty className="w-full p-2 ">{emptyMessage ?? "No items."}</CommandEmpty>
              )}

            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  )
}

export default AutoComplete