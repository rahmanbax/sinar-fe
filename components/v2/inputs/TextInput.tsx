import React from 'react'

type TextInputProps = {
    id: string,
    label: string,
    value?: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    required?: boolean,
    disabled?: boolean,
    placeholder?: string
}

const TextInput = ({ id, label, value, onChange, required = false, disabled, placeholder }: TextInputProps) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold black mb-2"
            >
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <input
                type="text"
                id={id}
                value={value}
                onChange={onChange}
                name={id}
                placeholder={placeholder || `Masukkan ${label}`}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition-all placeholder:text-gray-400 ${disabled ? 'bg-gray-100' : ''}`}
                required={required}
                disabled={disabled}
            />
        </div>
    )
}

export default TextInput