import React from 'react'

type ButtonProps = {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    secondary?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const ButtonComponent = ({
    label = 'Button Label',
    icon,
    onClick,
    secondary = false,
    className = '',
    disabled = false,
    type = 'button'
}: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`
                flex items-center gap-1 md:gap-2 font-medium w-fit text-sm md:text-base py-2 px-4 rounded-md transition justify-center 
                ${secondary
                    ? 'bg-white text-navy-500 border border-navy-500 hover:bg-gray-100'
                    : 'bg-navy-500 text-white hover:bg-navy-400 border border-transparent'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
        >
            {icon}
            {label}
        </button>
    )
}

export default ButtonComponent