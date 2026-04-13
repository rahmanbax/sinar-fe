"use client";

import React, { useState, useEffect } from 'react';
import DropdownInput from '@/components/v2/inputs/DropdownInput';
import ButtonComponent from '../buttons/ButtonComponent';
import { X } from 'lucide-react';

export type FilterState = Record<string, string>;

export interface FilterField {
    id: string;
    label: string;
    placeholder?: string;
    options: { label: string; value: string }[];
    searchable?: boolean;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply?: (filters: FilterState) => void;
    onFieldChange?: (id: string, value: string) => void;
    initialFilters?: FilterState;
    fields: FilterField[];
}

const FilterModal = ({ isOpen, onClose, onApply, onFieldChange, initialFilters, fields }: FilterModalProps) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters || {});

    useEffect(() => {
        if (isOpen && initialFilters) {
            setFilters(initialFilters);
        }
    }, [isOpen, initialFilters]);

    if (!isOpen) return null;

    const handleApply = () => {
        if (onApply) {
            onApply(filters);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg w-full max-w-sm p-5 space-y-5">
                <div className='flex items-center justify-between'>
                    <h2 className="text-xl font-bold text-gray-900">Filter</h2>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field) => (
                        <DropdownInput
                            key={field.id}
                            label={field.label}
                            placeholder={field.placeholder || field.label}
                            value={filters[field.id] || ''}
                            onChange={(val) => {
                                setFilters({ ...filters, [field.id]: val });
                                onFieldChange?.(field.id, val);
                            }}
                            options={field.options}
                            searchable={field.searchable}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-2">
                    <ButtonComponent
                        label="Batalkan"
                        onClick={onClose}
                        secondary
                        className='w-full'
                    />
                    <ButtonComponent
                        label="Terapkan"
                        onClick={handleApply}
                        className='w-full'
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
