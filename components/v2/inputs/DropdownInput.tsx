"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { List } from 'react-window';

export interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
    placeholder?: string;
    className?: string;
    searchable?: boolean;
    required?: boolean;
    allowCustomValue?: boolean;
}

const DropdownInput = ({
    label,
    value,
    onChange,
    options = [],
    placeholder,
    className = "",
    searchable = false,
    required = false,
    allowCustomValue = false
}: DropdownInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ensure unique options by value to prevent React "duplicate key" warnings
    const uniqueOptions = useMemo(() => {
        const seen = new Set();
        return options.filter(opt => {
            if (seen.has(opt.value)) return false;
            seen.add(opt.value);
            return true;
        });
    }, [options]);

    // Filter options based on search query and push selected to top
    const filteredOptions = useMemo(() => {
        const rawFiltered = uniqueOptions.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

        let result = rawFiltered;
        if (value) {
            const selected = rawFiltered.filter(opt => opt.value === value);
            const others = rawFiltered.filter(opt => opt.value !== value);
            result = [...selected, ...others];
        }

        // Limit the displayed data to 50 items
        return result.slice(0, 50);
    }, [uniqueOptions, searchQuery, value]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

    // If custom value allowed and not empty, show as first option if not in list
    const showCustomOption = useMemo(() => 
        allowCustomValue && searchQuery && !options.find(opt => opt.label.toLowerCase() === searchQuery.toLowerCase()
    ), [allowCustomValue, searchQuery, options]);

    const Row = useCallback(({ index, style, ariaAttributes }: any) => {
        const opt = filteredOptions[index];
        if (!opt) return null;

        return (
            <div
                {...ariaAttributes}
                style={style}
                onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery("");
                }}
                className={`flex items-center px-3 cursor-pointer hover:bg-gray-100 transition-colors ${value === opt.value ? 'bg-gray-100 text-black font-semibold' : 'text-black'
                    }`}
            >
                <span className="truncate text-base">{opt.label}</span>
            </div>
        );
    }, [filteredOptions, onChange, value]);

    return (
        <div className={`flex flex-col gap-2 ${className}`} ref={dropdownRef}>
            {label && <label className="block text-sm font-semibold text-black">{label} {required && <span className="text-red-600">*</span>}</label>}

            <div className="relative">
                {/* Custom Trigger */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-3 py-2 border-1 rounded-lg focus:outline-none flex items-center justify-between transition-all select-none ${isOpen ? 'border-navy-300 ring-1 ring-navy-300' : 'border-gray-300'
                        } ${!value ? 'text-gray-500' : 'text-black'}`}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : (value && allowCustomValue ? value : (placeholder || "Pilih opsi..."))}
                    </span>
                    <ChevronDown size={18} strokeWidth={2} className={`text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden flex flex-col">
                        {searchable && (
                            <div className="p-2 border-b border-gray-200 flex items-center gap-2 cursor-text" onClick={(e) => e.stopPropagation()}>
                                <Search size={14} className="text-gray-400 shrink-0 ml-1" />
                                <input
                                    type="text"
                                    className="w-full text-sm bg-transparent outline-none placeholder:text-gray-400"
                                    placeholder="Cari..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="bg-white">
                            {!searchQuery && (
                                <div
                                    onClick={() => {
                                        onChange("");
                                        setIsOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 text-gray-500`}
                                >
                                    Pilih opsi...
                                </div>
                            )}

                            {showCustomOption && (
                                <div
                                    onClick={() => {
                                        onChange(searchQuery);
                                        setIsOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 text-sm flex items-center gap-2`}
                                >
                                    <span className="font-semibold">"{searchQuery}"</span>
                                </div>
                            )}

                            {filteredOptions.length > 0 ? (
                                <List
                                    style={{
                                        height: filteredOptions.length > 5 ? 220 : filteredOptions.length * 44,
                                        width: '100%'
                                    }}
                                    rowCount={filteredOptions.length}
                                    rowHeight={44}
                                    rowComponent={Row}
                                    rowProps={{}}
                                    className="custom-scrollbar"
                                />
                            ) : (
                                !showCustomOption && (
                                    <div className="px-3 py-4 text-sm text-center text-gray-400">
                                        Hasil tidak ditemukan
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Native Select Fallback (Hidden) */}
            <select
                className="hidden"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" disabled hidden>{placeholder || "Pilih..."}</option>
                {uniqueOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default DropdownInput;
