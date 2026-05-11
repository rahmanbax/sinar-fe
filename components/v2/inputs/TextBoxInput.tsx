import React from 'react'

type TextBoxInputProps = {
    id: string,
    label: string,
    value?: string,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    required: boolean,
    disabled?: boolean
}

const TextBoxInput = ({ id, label, value, onChange, required, disabled }: TextBoxInputProps) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-gray-900 mb-2"
            >
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <textarea
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={`Masukkan ${label}`}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500`}
                required={required}
                disabled={disabled}
            />
        </div>
    )
}

export default TextBoxInput