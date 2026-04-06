import React from 'react';
import { Calendar } from 'lucide-react';

export interface CalendarInputProps {
    id: string;
    label: string;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
}

const CalendarInput = ({ id, label, value, onChange, required = false, disabled = false }: CalendarInputProps) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-gray-900 mb-2"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    type="date"
                    id={id}
                    value={value || ""}
                    onChange={onChange}
                    name={id}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition-all text-gray-700 
                    [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer 
                    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                    required={required}
                    disabled={disabled}
                />
                {/* Custom Icon Overlay */}
                <Calendar 
                    size={18} 
                    className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${disabled ? 'text-gray-300' : 'text-gray-500'}`} 
                />
            </div>
        </div>
    );
};

export default CalendarInput;