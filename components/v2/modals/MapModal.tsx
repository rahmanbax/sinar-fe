"use client";

import React from 'react';
import { X } from 'lucide-react';
import MiniIndonesiaMap, { MiniMapMarker } from '../map/MiniIndonesiaMap';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    markers?: MiniMapMarker[];
}

const MapModal = ({ isOpen, onClose, markers = [] }: MapModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg h-2/3 p-5 flex flex-col gap-5 w-full lg:w-2/3 ">
                <div className='flex items-center justify-between shrink-0'>
                    <h2 className="text-xl font-bold text-gray-900">Peta</h2>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border border-gray-100">
                    <MiniIndonesiaMap markers={markers} />
                </div>
            </div>
        </div>
    )
}

export default MapModal