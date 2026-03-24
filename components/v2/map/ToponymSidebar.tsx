"use client";

import { useState } from "react";

import { X, Loader2, Info, MapPin, Globe, History, Image as ImageIcon } from "lucide-react";
import { useToponymDetail } from "@/hooks/useToponyms";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import ImageModal from "../modals/ImageModal";

interface ToponymSidebarProps {
    toponymId: string | null;
    onClose: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-400 shrink-0">{label}</span>
        <span className="text-sm text-right">{value || "-"}</span>
    </div>
);

export default function ToponymSidebar({ toponymId, onClose }: ToponymSidebarProps) {
    const { data, isLoading, error } = useToponymDetail(toponymId);
    const toponym = data?.data;
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    return (
        <AnimatePresence>
            {toponymId && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-0 left-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-60 flex flex-col border-r border-gray-100"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-white sticky top-0 z-10">
                        <h2 className="text-base font-bold text-navy-900 truncate pr-4 w-full">
                            {isLoading ? (
                                <div className="h-5 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                            ) : toponym?.map_name || "Detail Toponim"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-900 cursor-pointer"
                        >
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col w-full animate-pulse p-5 gap-6">
                                {/* Photo Skeleton */}
                                <div className="w-full h-48 bg-gray-200 rounded-xl"></div>
                                
                                {/* Section General Info Skeleton */}
                                <div className="space-y-3">
                                    <div className="h-3 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                                    <div className="bg-gray-50/80 rounded-xl p-4 space-y-4">
                                        <div className="flex justify-between"><div className="h-3 bg-gray-200 rounded-md w-1/4"></div><div className="h-3 bg-gray-300 rounded-md w-1/3"></div></div>
                                        <div className="flex justify-between"><div className="h-3 bg-gray-200 rounded-md w-1/4"></div><div className="h-3 bg-gray-300 rounded-md w-2/5"></div></div>
                                        <div className="flex justify-between"><div className="h-3 bg-gray-200 rounded-md w-1/4"></div><div className="h-3 bg-gray-300 rounded-md w-1/2"></div></div>
                                    </div>
                                </div>
                                
                                {/* Section Geography Skeleton */}
                                <div className="space-y-3">
                                    <div className="h-3 bg-gray-200 rounded-md w-2/5 mb-4"></div>
                                    <div className="bg-gray-50/80 rounded-xl p-4 space-y-4">
                                        <div className="flex justify-between"><div className="h-3 bg-gray-200 rounded-md w-1/4"></div><div className="h-3 bg-gray-300 rounded-md w-1/3"></div></div>
                                        <div className="flex justify-between"><div className="h-3 bg-gray-200 rounded-md w-1/4"></div><div className="h-3 bg-gray-300 rounded-md w-1/4"></div></div>
                                        <div className="flex justify-between"><div className="h-3 bg-gray-200 rounded-md w-1/4"></div><div className="h-3 bg-gray-300 rounded-md w-2/3"></div></div>
                                    </div>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info className="text-red-500" size={32} />
                                </div>
                                <h3 className="text-base font-bold mb-1">Gagal memuat data</h3>
                                <p className="text-sm text-gray-500">Terjadi kesalahan saat mengambil data. Silahkan muat ulang halaman.</p>
                            </div>
                        ) : toponym ? (
                            <div className="flex flex-col">
                                {/* Photo Section */}
                                {toponym.photos && toponym.photos.length > 0 ? (
                                    <div className="w-full h-56 bg-gray-100 relative">
                                        <Swiper
                                            modules={[Pagination, Navigation]}
                                            pagination={{ clickable: true }}
                                            navigation={true}
                                            className="w-full h-full"
                                            style={{
                                                '--swiper-pagination-color': '#ffffff',
                                                '--swiper-navigation-color': '#ffffff',
                                                '--swiper-navigation-size': '20px',
                                            } as React.CSSProperties}
                                        >
                                            {toponym.photos.map((photo, idx) => (
                                                <SwiperSlide key={idx} className="h-full relative">
                                                    <img
                                                        src={photo.url}
                                                        alt={`${toponym.local_name} ${idx + 1}`}
                                                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
                                                        onClick={() => setSelectedImageIndex(idx)}
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <span className="text-xs font-medium">Tidak ada foto</span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-5">
                                    <div className="space-y-6">
                                        {/* General Info */}
                                        <section>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Info size={14} /> Informasi Umum
                                            </h3>
                                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                                {/* <DetailItem label="ID Unsur" value={toponym.element.code} /> */}
                                                <DetailItem label="Jenis Unsur" value={toponym.element.name} />
                                                <DetailItem label="Nama Peta" value={toponym.map_name} />
                                                <DetailItem label="Nama Lain" value={toponym.other_name} />
                                                {/* <DetailItem label="Status" value={
                                                    <span className={`px-2 py-0.5 rounded-full text-xs uppercase font-bold ${
                                                        toponym.status === "baku" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                        {toponym.status}
                                                    </span>
                                                } /> */}
                                            </div>
                                        </section>

                                        {/* Geography */}
                                        <section>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <MapPin size={14} /> Geografi & Lokasi
                                            </h3>
                                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                                {/* <DetailItem label="Tipe Geometri" value={toponym.geometry_type} /> */}
                                                <DetailItem label="Bujur" value={toponym.location_point?.coordinates[0].toFixed(7)} />
                                                <DetailItem label="Lintang" value={toponym.location_point?.coordinates[1].toFixed(7)} />
                                                <DetailItem label="Elevasi" value={toponym.elevation_value ? `${toponym.elevation_value} mdpl` : "-"} />
                                                <DetailItem label="Provinsi" value={toponym.province?.name} />
                                                <DetailItem label="Kabupaten/Kota" value={toponym.regency?.name} />
                                                <DetailItem label="Kecamatan" value={toponym.district?.name} />
                                                <DetailItem label="Desa/Kelurahan" value={toponym.village?.name} />
                                            </div>
                                        </section>

                                        {/* Cultural */}
                                        <section>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Globe size={14} /> Budaya & Bahasa
                                            </h3>
                                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                                <DetailItem label="Asal Bahasa" value={toponym.language_origin} />
                                                <DetailItem label="Arti Nama" value={
                                                    <p className="leading-relaxed text-right">{toponym.name_meaning}</p>
                                                } />
                                            </div>
                                        </section>

                                        {/* History & Notes */}
                                        <section>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <History size={14} /> Sejarah & Catatan
                                            </h3>
                                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                                <div className="py-2">
                                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Sejarah Nama</span>
                                                    <p className="leading-relaxed text-navy-800">{toponym.name_history || "-"}</p>
                                                </div>
                                                <div className="py-2 border-t border-gray-100 mt-2">
                                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Catatan Tambahan</span>
                                                    <p className="leading-relaxed text-navy-800">{toponym.notes || "-"}</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* <div className="mt-8 pb-4 text-center">
                                        <span className="text-xs text-gray-400">Sumber: {toponym.source}</span>
                                    </div> */}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Image Modal for Fullscreen View */}
                    <ImageModal 
                        isOpen={selectedImageIndex !== null} 
                        onClose={() => setSelectedImageIndex(null)} 
                        images={toponym?.photos?.map((p: any) => p.url) || []} 
                        initialSlideIndex={selectedImageIndex || 0}
                        altText={toponym?.map_name || toponym?.local_name || "Foto Objek"} 
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
