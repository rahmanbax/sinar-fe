import React from 'react'

type ButtonProps = {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

const ButtonComponent = ({
    label = 'Button Label',
    icon,
    onClick,
    className = ''
}: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 font-medium bg-navy-500 py-2 px-4 rounded-md text-white hover:bg-navy-400 transition cursor-pointer
                ${className}
            `}
        >
            {icon}
            {label}
        </button>
    )
}

export default ButtonComponent