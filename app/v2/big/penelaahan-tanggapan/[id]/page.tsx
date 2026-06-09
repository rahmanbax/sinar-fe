"use client"

import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, MapPin, Check, Trash2, X } from 'lucide-react'
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSaran, setSelectedSaran] = useState<string | null>(null);

    const dummySaran = [
        { id: 1, saran: "Gelas Kaca", penanggap: "Jane", tanggal: "08/06/2026" },
        { id: 2, saran: "Gelas Kayu", penanggap: "John", tanggal: "08/06/2026" },
    ];

    const currentSaranList = selectedSaran 
        ? dummySaran.filter(s => s.saran !== selectedSaran)
        : dummySaran;

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
                            value="Gelas Teko" 
                            actionRight={<button onClick={() => setIsModalOpen(true)} className="text-navy-600 text-[11px] font-semibold cursor-pointer hover:underline focus:outline-none">Lihat Tanggapan (2)</button>} 
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

            {/* Modal Tanggapan Sejarah Nama */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 overflow-y-auto">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tanggapan Sejarah Nama</h2>
                            
                            <div className="flex flex-col gap-2 mb-6">
                                <span className="text-sm font-semibold text-gray-900">Sejarah Nama</span>
                                <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white">
                                    Gelas Teko
                                </div>

                                {selectedSaran && (
                                    <div className="flex flex-col items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-400 font-medium">akan menjadi</span>
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white">
                                                {selectedSaran}
                                            </div>
                                            <button 
                                                onClick={() => setSelectedSaran(null)}
                                                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-semibold text-gray-900">Saran Perubahan</span>
                                
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 w-16">No</th>
                                                <th className="px-4 py-3">Saran Perubahan</th>
                                                <th className="px-4 py-3">Nama Penanggap</th>
                                                <th className="px-4 py-3">Tanggal Tanggapan</th>
                                                <th className="px-4 py-3 w-24">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentSaranList.map((item, index) => (
                                                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                    <td className="px-4 py-3">{index + 1}</td>
                                                    <td className="px-4 py-3">{item.saran}</td>
                                                    <td className="px-4 py-3">{item.penanggap}</td>
                                                    <td className="px-4 py-3">{item.tanggal}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => setSelectedSaran(item.saran)}
                                                                className="p-1.5 border border-green-500 text-green-500 rounded hover:bg-green-50 cursor-pointer transition-colors"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button className="p-1.5 border border-red-500 text-red-500 rounded hover:bg-red-50 cursor-pointer transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    onClick={() => { setIsModalOpen(false); setSelectedSaran(null); }}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button 
                                    disabled={!selectedSaran}
                                    onClick={() => { setIsModalOpen(false); setSelectedSaran(null); }}
                                    className={`px-8 py-2.5 font-semibold rounded-lg w-full transition-colors ${
                                        selectedSaran ? 'bg-navy-700 text-white hover:bg-navy-800' : 'bg-[#A3A3A3] text-white cursor-not-allowed'
                                    }`}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
