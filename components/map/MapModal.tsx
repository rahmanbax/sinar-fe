import React, { useState, useEffect, ReactNode } from "react";
import { Map as MapIcon, X } from "lucide-react";
import { StatMap } from "./StatMap";

interface MapModalProps {
    trigger?: ReactNode;
}

export const MapModal = ({ trigger }: MapModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            {/* Trigger */}
            <div onClick={() => setIsOpen(true)}>
                {trigger || (
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 cursor-pointer shadow-sm">
                        <MapIcon size={20} className="text-[#0370A2]" />
                        Lihat Peta
                    </button>
                )}
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-[95vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Peta Sebaran Toponim</h3>
                                <p className="text-sm text-gray-500">Mencakup seluruh wilayah kedaulatan Indonesia.</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-h-0 w-full relative">
                            <StatMap />
                        </div>

                        {/* Footer (Optional) */}
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
