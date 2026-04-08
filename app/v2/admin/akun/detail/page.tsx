"use client";

import React from 'react';
import AdminLayout from '@/components/v2/nav/AdminLayout';
import TextInput from '@/components/v2/inputs/TextInput';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const DetailAkunPage = () => {
    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-4 gap-2">
                    <Link href="/v2/admin" className="hover:text-navy-900 transition-colors">Dashboard</Link>
                    <ChevronRight size={14} />
                    <Link href="/v2/admin/akun" className="hover:text-navy-900 transition-colors">Akun</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-400">Detail Akun</span>
                </nav>

                {/* Title */}
                <h1 className="text-2xl font-bold text-navy-900 mb-8">Detail Akun</h1>

                {/* Card Container */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-navy-900 mb-6 border-b border-gray-50 pb-4">Data Akun</h2>

                        <div className="flex flex-col gap-6">
                            {/* Nama */}
                            <TextInput
                                id="nama"
                                label="Nama"
                                value="Admin Kota"
                                onChange={() => {}}
                                required={false}
                                disabled
                            />

                            {/* Email */}
                            <TextInput
                                id="email"
                                label="Email"
                                value="adminkota@gmail.com"
                                onChange={() => {}}
                                required={false}
                                disabled
                            />

                            {/* No. Telepon WhatsApp */}
                            <TextInput
                                id="wa"
                                label="No. Telepon WhatsApp"
                                value="081234567890"
                                onChange={() => {}}
                                required={false}
                                disabled
                            />

                            {/* Provinsi */}
                            <TextInput
                                id="provinsi"
                                label="Provinsi"
                                value="Jawa Barat"
                                onChange={() => {}}
                                required={false}
                                disabled
                            />

                            {/* Kab/ Kota */}
                            <TextInput
                                id="kota"
                                label="Kab/ Kota"
                                value="Kota Bandung"
                                onChange={() => {}}
                                required={false}
                                disabled
                            />

                            {/* Preview Dokumen */}
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">
                                    Preview Dokumen
                                </label>
                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-3">
                                    <FileText size={40} className="text-navy-900" />
                                    <p className="text-sm font-medium text-gray-700">Surat Permohonan Admin Kab/ Kota.pdf</p>
                                    <Link href="#" className="text-sm font-bold text-navy-600 hover:text-navy-800 underline">
                                        Lihat
                                    </Link>
                                </div>
                            </div>

                            {/* Status Akun */}
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <TextInput
                                        id="status"
                                        label="Status Akun"
                                        value="Nonaktif"
                                        onChange={() => {}}
                                        required={false}
                                        disabled
                                    />
                                </div>
                                <ButtonComponent 
                                    label="Aktifkan Akun" 
                                    className="h-[42px] px-8" // Adjusted to match input height
                                    onClick={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DetailAkunPage;
