import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    initialSlideIndex?: number;
    altText?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, images, initialSlideIndex = 0, altText }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Don't render if no images
    if (!images || images.length === 0) return null;

    return (
        <div 
            className={`fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out ${
                isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
            }`}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/80 cursor-pointer"
            />

            {/* Modal Content */}
            <div
                className={`relative w-full h-[90vh] max-w-6xl flex flex-col items-center justify-center rounded-2xl overflow-hidden z-10 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'scale-100' : 'scale-95'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-20 cursor-pointer"
                            aria-label="Tutup"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="w-full h-full flex items-center justify-center text-white">
                            {images.length === 1 ? (
                                <img 
                                    src={images[0]} 
                                    alt={altText || "Gambar Pratinjau"} 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <Swiper
                                    modules={[Navigation, Pagination, Keyboard]}
                                    spaceBetween={20}
                                    slidesPerView={1}
                                    initialSlide={initialSlideIndex}
                                    navigation
                                    pagination={{ clickable: true }}
                                    keyboard={{ enabled: true }}
                                    className="w-full h-full"
                                    style={{
                                        '--swiper-navigation-color': '#ffffff',
                                        '--swiper-pagination-color': '#ffffff',
                                    } as React.CSSProperties}
                                >
                                    {images.map((src, idx) => (
                                        <SwiperSlide key={idx} className="flex items-center justify-center h-full">
                                            <div className="w-full h-full p-2 md:p-12 flex items-center justify-center">
                                                <img 
                                                    src={src} 
                                                    alt={`${altText} ${idx + 1}`} 
                                                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}
                        </div>
            </div>
        </div>
    );
};

export default ImageModal;
