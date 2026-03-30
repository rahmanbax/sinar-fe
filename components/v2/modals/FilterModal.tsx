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
    onChange?: (filters: FilterState) => void;
    initialFilters?: FilterState;
    fields: FilterField[];
}

const FilterModal = ({ isOpen, onClose, onApply, onChange, initialFilters, fields }: FilterModalProps) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters || {});

    useEffect(() => {
        if (isOpen) {
            setFilters(initialFilters || {});
        }
    }, [isOpen, initialFilters]);

    const handleApply = () => {
        if (onApply) {
            onApply(filters);
        }
        onClose();
    };

    const handleReset = () => {
        setFilters({});
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${!isOpen && 'hidden'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl flex flex-col">
                <div className='flex items-center justify-between mb-6'>
                    <h2 className="text-xl font-bold text-gray-900">Filter</h2>
                </div>

                <div className="space-y-5 max-h-[60vh] overflow-y-auto px-1 -mx-1 custom-scrollbar">
                    {fields.map((field) => (
                        <DropdownInput
                            key={field.id}
                            label={field.label}
                            placeholder={field.placeholder || field.label}
                            value={filters[field.id] || ''}
                            onChange={(val) => {
                                const newFilters = { ...filters, [field.id]: val };
                                
                                // Reset dependent filters if province changes
                                if (field.id === 'provinsi') {
                                    newFilters.kabupaten = '';
                                }
                                
                                setFilters(newFilters);
                                if (onChange) onChange(newFilters);
                            }}
                            options={field.options}
                            searchable={field.searchable}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-8">
                    <ButtonComponent
                        label="Batalkan"
                        onClick={onClose}
                        secondary
                        className='flex-1 justify-center'
                    />
                    <ButtonComponent
                        label="Terapkan"
                        onClick={handleApply}
                        className='flex-1 justify-center'
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
