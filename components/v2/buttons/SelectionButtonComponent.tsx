import React from 'react'

type SelectionButtonProps = {
    label: string;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    selected?: boolean;
}

const SelectionButtonComponent = ({
    label,
    onClick,
    className = '',
    disabled = false,
    selected = false,
}: SelectionButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`bg-white px-4 py-2 rounded-lg border font-medium w-full hover:bg-gray-100 cursor-pointer ${selected ? 'border-navy-500 text-navy-500' : ''}`}
        >
            {label}
        </button>
    )
}

export default SelectionButtonComponent