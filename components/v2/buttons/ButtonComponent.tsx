import React from 'react'

type ButtonProps = {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    secondary?: boolean;
    disabled?: boolean;
}

const ButtonComponent = ({
    label = 'Button Label',
    icon,
    onClick,
    secondary = false,
    className = '',
    disabled = false
}: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-2 font-medium py-2 px-4 rounded-md transition cursor-pointer justify-center
                ${secondary 
                    ? 'bg-white hover:bg-gray-100 text-navy-500 border border-navy-500 hover:bg-gray-50' 
                    : 'bg-navy-500 text-white hover:bg-navy-400 border border-transparent'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {icon}
            {label}
        </button>
    )
}

export default ButtonComponent