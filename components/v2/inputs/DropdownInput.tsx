"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

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
}

const DropdownInput = ({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder, 
    className = "" 
}: DropdownInputProps) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && <label className="text-sm font-semibold text-gray-900">{label}</label>}
            <div className="relative">
                <select 
                    className={`w-full appearance-none bg-white border border-gray-200 py-2 px-3 rounded-lg  focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 transition-all ${
                        !value ? 'text-gray-500' : 'text-gray-900'
                    }`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {placeholder && (
                        <option value="" disabled hidden>{placeholder}</option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-900">
                    <ChevronDown size={18} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
};

export default DropdownInput;
