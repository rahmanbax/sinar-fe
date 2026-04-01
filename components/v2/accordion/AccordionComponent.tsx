"use client";

import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

interface AccordionProps {
    title: string;
    children: React.ReactNode;
}

const AccordionComponent = ({ title, children }: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
            >
                <h2 className="font-semibold text-black text-xl">{title}</h2>
                <ChevronDown 
                    className={`text-gray-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    size={20}
                />
            </button>
            
            <div 
                className={`grid transition-all duration-300 ease-in-out  ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="p-4 text-gray-600 bg-gray-50">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccordionComponent