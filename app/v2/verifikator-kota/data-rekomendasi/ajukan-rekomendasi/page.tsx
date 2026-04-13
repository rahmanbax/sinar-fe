"use client";

import React, { useState } from "react";
import VerifikatorKotaLayout from "@/components/v2/nav/VerifikatorKotaLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import FileInput from "@/components/v2/inputs/FileInput";
import { ChevronRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Dummy Data matches Gambar 1
const dummyPenelaahan = [
    { id: "1", title: "Penelaahan Februari", count: 20 },
    { id: "2", title: "Penelaahan Februari", count: 20 },
    { id: "3", title: "Penelaahan Februari", count: 20 },
    { id: "4", title: "Penelaahan Februari", count: 20 },
    { id: "5", title: "Penelaahan Februari", count: 20 },
];

const AjukanRekomendasiPage = () => {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === dummyPenelaahan.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(dummyPenelaahan.map(d => d.id));
        }
    };

    return (
        <VerifikatorKotaLayout showNav={false}>
            <div className="w-full flex flex-col gap-8 py-4 md:px-12 lg:px-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400">
                    <Link href="/v2/verifikator-kota" className="hover:text-navy-600 transition-colors">Dashboard</Link>
                    <ChevronRight size={14} />
                    <Link href="/v2/verifikator-kota/data-rekomendasi" className="hover:text-navy-600 transition-colors">Data Rekomendasi</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-semibold">Ajukan Rekomendasi</span>
                </nav>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900">Ajukan Rekomendasi</h1>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    
                    {/* Left Column: Pilih Penelaahan */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-bold text-gray-900">Pilih Penelaahan</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 accent-navy-600"
                                                checked={selectedIds.length === dummyPenelaahan.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-4 py-3 w-12 text-center">No</th>
                                        <th className="px-4 py-3">Judul Penelaahan</th>
                                        <th className="px-4 py-3 text-right">Jumlah Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dummyPenelaahan.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-gray-300 accent-navy-600"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-900">{idx + 1}</td>
                                            <td className="px-4 py-4 text-gray-900">{item.title}</td>
                                            <td className="px-4 py-4 text-right text-gray-900 font-medium">{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column: Submission Form */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
                        {/* Jumlah Data (ReadOnly) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Jumlah Data</label>
                            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-medium">
                                {selectedIds.length > 0 ? selectedIds.length * 20 : 0}
                            </div>
                        </div>

                        {/* No. Surat Rekomendasi */}
                        <TextInput 
                            id="no_surat"
                            label="No. Surat Rekomendasi"
                            onChange={() => {}}
                        />

                        {/* Unggah Surat */}
                        <FileInput 
                            id="unggah_surat"
                            label="Unggah Surat"
                            onChange={() => {}}
                            instructions="Klik untuk unggah Surat"
                            icon={<FileText size={20} className="text-gray-400" />}
                        />

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <ButtonComponent 
                                label="Batalkan"
                                secondary
                                className="w-full py-2.5"
                                onClick={() => router.back()}
                            />
                            <ButtonComponent 
                                label="Ajukan"
                                disabled
                                className="w-full py-2.5 bg-gray-400 hover:bg-gray-400 border-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </VerifikatorKotaLayout>
    );
};

export default AjukanRekomendasiPage;
