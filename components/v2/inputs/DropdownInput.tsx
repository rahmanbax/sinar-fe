"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

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
}

const DropdownInput = ({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder, 
    className = "",
    searchable = false
}: DropdownInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search query
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`flex flex-col gap-2 ${className}`} ref={dropdownRef}>
            {label && <label className="text-sm font-semibold text-gray-900">{label}</label>}
            
            <div className="relative">
                {/* Custom Trigger */}
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full cursor-pointer bg-white border border-gray-200 py-2.5 px-3 rounded-lg flex items-center justify-between focus-within:ring-2 focus-within:ring-navy-500/20 focus-within:border-navy-600 transition-all select-none ${
                        !value ? 'text-gray-500' : 'text-gray-900'
                    }`}
                >
                    <span className="truncate text-sm">
                        {selectedOption ? selectedOption.label : (placeholder || "Pilih opsi...")}
                    </span>
                    <ChevronDown size={18} strokeWidth={2} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col">
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
                        
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <div 
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-100 ${
                                            value === opt.value ? 'bg-gray-100' : 'text-gray-500'
                                        }`}
                                    >
                                        {opt.label}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-sm text-center text-gray-400">
                                    Hasil tidak ditemukan
                                </div>
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
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default DropdownInput;
