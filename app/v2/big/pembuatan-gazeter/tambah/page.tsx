"use client";

import React, { useState } from 'react';
import { File } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import TextInput from '@/components/v2/inputs/TextInput';
import Link from 'next/link';

const BuatGazeterPage = () => {
    const [judul, setJudul] = useState('');

    return (
        <DashboardLayout showNav={false}>
            <div className="max-w-6xl mx-auto py-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
                    <Link href="/v2/big" className="hover:text-gray-900 transition-colors">Dashboard</Link>
                    <span className="text-gray-400">/</span>
                    <Link href="/v2/big/pembuatan-gazeter" className="hover:text-gray-900 transition-colors">Pembuatan GRI</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-400">Buat Gazeter</span>
                </div>

                <div className="mb-6">
                    <h1 className="text-[22px] font-bold text-gray-900">Buat Gazeter</h1>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col gap-6">
                        
                        {/* Foto Cover Upload Box */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-semibold text-gray-900">Foto Cover</span>
                            <button className="w-full flex flex-col items-center justify-center gap-2 h-32 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:bg-gray-50 transition cursor-pointer">
                                <File size={24} />
                                <span className="text-sm">Klik untuk unggah Foto Cover</span>
                            </button>
                        </div>

                        {/* Judul Gazeter Input */}
                        <TextInput
                            id="judul"
                            label="Judul Gazeter"
                            placeholder="Masukkan Sumber Data"
                            value={judul}
                            onChange={(e) => setJudul(e.target.value)}
                        />

                        {/* Buttons */}
                        <div className="flex items-center gap-4 mt-2">
                            <Link href="/v2/big/pembuatan-gazeter" className="flex-1">
                                <button className="w-full py-2.5 border border-navy-600 text-navy-600 font-semibold text-sm rounded-lg hover:bg-navy-50 transition-colors cursor-pointer">
                                    Batalkan
                                </button>
                            </Link>
                            <button
                                className="flex-1 py-2.5 bg-[#A3A3A3] text-white font-semibold text-sm rounded-lg cursor-not-allowed"
                                disabled
                            >
                                Buat Gazeter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BuatGazeterPage;
