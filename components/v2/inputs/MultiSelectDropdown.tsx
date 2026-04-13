"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { List } from 'react-window';

export interface DropdownOption {
    label: string;
    value: string;
}

interface MultiSelectDropdownProps {
    label?: string;
    value: string[];
    onChange: (value: string[]) => void;
    options: DropdownOption[];
    placeholder?: string;
    className?: string;
    searchable?: boolean;
    required?: boolean;
    disabled?: boolean;
}

const MultiSelectDropdown = ({
    label,
    value = [],
    onChange,
    options = [],
    placeholder,
    className = "",
    searchable = true,
    required = false,
    disabled = false
}: MultiSelectDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const uniqueOptions = useMemo(() => {
        const seen = new Set();
        return options.filter(opt => {
            if (seen.has(opt.value)) return false;
            seen.add(opt.value);
            return true;
        });
    }, [options]);

    const filteredOptions = useMemo(() => {
        return uniqueOptions.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [uniqueOptions, searchQuery]);

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

    const selectedOptions = useMemo(() => options.filter(opt => value.includes(opt.value)), [options, value]);

    const toggleOption = (val: string) => {
        if (value.includes(val)) {
            onChange(value.filter(v => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    const Row = useCallback(({ index, style, ariaAttributes }: any) => {
        const opt = filteredOptions[index];
        if (!opt) return null;

        const isSelected = value.includes(opt.value);

        return (
            <div
                {...ariaAttributes}
                style={style}
                onClick={() => toggleOption(opt.value)}
                className={`flex items-center justify-between px-3 cursor-pointer hover:bg-navy-50 transition-colors ${isSelected ? 'bg-navy-50 text-navy-500 font-medium' : 'text-black'}`}
            >
                <div className="flex items-center gap-3 w-full h-full">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-navy-600 border-navy-600' : 'border-gray-300'}`}>
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="truncate text-base">{opt.label}</span>
                </div>
            </div>
        );
    }, [filteredOptions, value, onChange]);

    return (
        <div className={`flex flex-col gap-2 ${className}`} ref={dropdownRef}>
            {label && <label className="block text-sm font-semibold text-black">{label} {required && <span className="text-red-600">*</span>}</label>}

            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full min-h-[42px] px-3 py-2 border-1 border-gray-300 rounded-lg focus:outline-none flex items-center justify-between transition-all select-none ${isOpen ? 'border-navy-300 ring-1 ring-navy-300' : 'border-gray-300'} ${value.length === 0 ? 'text-gray-500' : 'text-black'} ${disabled ? 'bg-gray-100' : 'cursor-pointer bg-white'}`}
                >
                    <div className="flex flex-wrap gap-1 flex-1 overflow-hidden pr-2">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map(opt => (
                                <span key={opt.value} className="bg-navy-50 text-navy-500 font-medium px-2 py-0.5 rounded text-sm whitespace-nowrap">
                                    {opt.label}
                                </span>
                            ))
                        ) : (
                            <span className="truncate">{placeholder || "Pilih opsi..."}</span>
                        )}
                    </div>
                    <ChevronDown size={18} strokeWidth={2} className={`text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

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
                            {filteredOptions.length > 0 ? (
                                <List
                                    style={{
                                        height: Math.min(filteredOptions.length * 44, 220),
                                        width: '100%'
                                    }}
                                    rowCount={filteredOptions.length}
                                    rowHeight={44}
                                    rowComponent={Row}
                                    rowProps={{}}
                                    className="custom-scrollbar"
                                />
                            ) : (
                                <div className="px-3 py-4 text-sm text-center text-gray-400">
                                    Hasil tidak ditemukan
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiSelectDropdown;
