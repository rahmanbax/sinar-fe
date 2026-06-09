"use client"

import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, MapPin } from 'lucide-react'
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap'

const ReadOnlyField = ({ label, value, actionRight }: { label: string, value: string, actionRight?: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">{label}</span>
            {actionRight}
        </div>
        <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 w-full min-h-[42px] break-words">
            {value}
        </div>
    </div>
);

const DashedBox = ({ label, icon }: { label: string, icon: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <div className="flex items-center justify-center w-full h-16 border border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-gray-400">
            {icon}
        </div>
    </div>
);

export default function DetailPenelaahanTanggapanPage() {
    return (
        <DashboardLayout showNav={false} tightMargin={true}>
            <div className="flex h-full w-full bg-white">
                {/* Left Pane: Form */}
                <div className="w-[450px] flex flex-col h-full shrink-0 border-r border-gray-200">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100 shrink-0">
                        <Link href="/v2/big/penelaahan-tanggapan" className="p-1 hover:bg-gray-100 rounded-lg transition">
                            <ArrowLeft size={20} className="text-gray-900" />
                        </Link>
                        <h1 className="font-bold text-gray-900 text-lg">Detail Toponim</h1>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        {/* Tanggapan Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 text-sm mb-3">Tanggapan untuk Penghapusan Toponim (3)</h3>
                            
                            <div className="flex flex-col gap-1 mb-3">
                                <span className="text-xs text-gray-500 font-medium">Alasan</span>
                                <span className="text-sm font-semibold text-gray-900">Lorem ipsum dolor sit amet</span>
                            </div>

                            <div className="flex flex-col gap-1 mb-5">
                                <span className="text-xs text-gray-500 font-medium">Bukti</span>
                                <div className="w-20 h-20 bg-gray-300 rounded-lg mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="w-full py-2 border border-navy-600 text-navy-600 font-semibold text-sm rounded-lg hover:bg-navy-50 transition">
                                    Tolak
                                </button>
                                <button className="w-full py-2 bg-navy-600 text-white font-semibold text-sm rounded-lg hover:bg-navy-700 transition">
                                    Setujui Penghapusan
                                </button>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex flex-col gap-3">
                            <h4 className="text-xs font-semibold text-gray-900 mb-1">Koordinat</h4>
                            <div>
                                <span className="text-[11px] text-gray-500 font-medium">Bujur</span>
                                <p className="text-sm font-semibold text-gray-900">-6.21462</p>
                            </div>
                            <div>
                                <span className="text-[11px] text-gray-500 font-medium">Lintang</span>
                                <p className="text-sm font-semibold text-gray-900">106.84513</p>
                            </div>
                        </div>

                        <ReadOnlyField label="Elemen Generik" value="Elemen Generik" />
                        <ReadOnlyField label="Elemen Spesifik" value="Elemen Spesifik" />
                        
                        <div className="flex flex-col gap-1.5 mb-4">
                            <span className="text-xs font-semibold text-gray-700">Nama Rupabumi</span>
                            <div className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900 w-full min-h-[42px]">
                                Nama Rupabumi
                            </div>
                        </div>

                        <ReadOnlyField label="Nama Lain" value="Nama Lain" />
                        <ReadOnlyField label="Asal Bahasa" value="Asal Bahasa" />
                        <ReadOnlyField label="Arti Nama" value="Arti Nama" />
                        
                        <ReadOnlyField 
                            label="Sejarah Nama" 
                            value="Sejarah Nama" 
                            actionRight={<span className="text-navy-600 text-[11px] font-semibold cursor-pointer hover:underline">Lihat Tanggapan (2)</span>} 
                        />
                        
                        <ReadOnlyField label="Pelafalan" value="Pelafalan" />
                        <ReadOnlyField label="Ejaan" value="Ejaan" />
                        <ReadOnlyField label="Jenis Unsur" value="Jenis Unsur" />
                        <ReadOnlyField label="Provinsi" value="Provinsi" />
                        <ReadOnlyField label="Kabupaten/ Kota" value="Kabupaten/ Kota" />
                        <ReadOnlyField label="Kecamatan" value="Kecamatan" />
                        <ReadOnlyField label="Desa/ Kelurahan" value="Desa/ Kelurahan" />
                        <ReadOnlyField label="Tanggal Survey" value="Tanggal Survey" />

                        <DashedBox label="Foto" icon={<Camera size={20} />} />
                        <DashedBox label="Sketsa Lokasi" icon={<MapPin size={20} />} />
                        <DashedBox label="Rekaman Suara Pengucapan" icon={<Camera size={20} />} />
                        <DashedBox label="Rekaman Audio Visual" icon={<Camera size={20} />} />
                        <DashedBox label="Dokumen Pendukung" icon={<Camera size={20} />} />
                    </div>

                    {/* Bottom Action */}
                    <div className="p-4 border-t border-gray-100 shrink-0 grid grid-cols-2 gap-3 bg-white">
                        <button className="w-full py-2.5 border border-navy-600 text-navy-600 font-semibold text-sm rounded-lg hover:bg-navy-50 transition">
                            Edit
                        </button>
                        <button className="w-full py-2.5 bg-navy-600 text-white font-semibold text-sm rounded-lg hover:bg-navy-700 transition">
                            Simpan Tanggapan
                        </button>
                    </div>
                </div>

                {/* Right Pane: Map */}
                <div className="flex-1 h-full bg-gray-200 relative">
                    <MiniIndonesiaMap 
                        markers={[
                            { longitude: 106.84513, latitude: -6.21462, label: "Nama Rupabumi" }
                        ]} 
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
