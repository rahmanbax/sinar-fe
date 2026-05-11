"use client";

import React, { useState, useMemo } from 'react';
import { Camera, ChevronRight, LayoutGrid, MapPin, Database } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import TextInput from '@/components/v2/inputs/TextInput';
import FileInput from '@/components/v2/inputs/FileInput';
import DropdownInput from '@/components/v2/inputs/DropdownInput';
import Link from 'next/link';

const BuatGazeterPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        judul: '',
        edisi: '',
        cover: null as File | null,
        jenisUnsur: '',
        provinsi: '',
        kabupatenKota: ''
    });

    const handleNext = () => setStep(2);
    const handlePrev = () => setStep(1);

    const candidateData = {
        jenisUnsur: [
            { name: 'Gunung', count: 20 },
            { name: 'Bukit', count: 15 },
            { name: 'Stadion', count: 10 },
            { name: 'Candi', count: 10 },
            { name: 'Laut', count: 5 },
        ],
        provinsi: [
            { name: 'JAWA BARAT', count: 20 },
            { name: 'JAWA TIMUR', count: 15 },
            { name: 'JAWA TENGAH', count: 10 },
            { name: 'BALI', count: 10 },
            { name: 'SUMATRA BARAT', count: 5 },
        ],
        kabupatenKota: [
            { name: 'KOTA BANDUNG', count: 20 },
            { name: 'KABUPATEN BANDUNG', count: 15 },
            { name: 'KOTA SURABAYA', count: 10 },
            { name: 'KOTA SEMARANG', count: 10 },
            { name: 'KOTA PADANG', count: 5 },
        ]
    };

    return (
        <DashboardLayout showNav={false}>
            <div className="max-w-6xl mx-auto py-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <Link href="/v2/big" className="hover: transition-colors">Dashboard</Link>
                    <span>/</span>
                    <Link href="/v2/big/pembuatan-gazeter" className="hover: transition-colors">Pembuatan GRI </Link>
                    <span>/</span>
                    <span className="text-gray-600">Buat Gazeter</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold ">Buat Gazeter</h1>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 1 ? 'bg-navy-900 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <div className="w-12 h-[2px] bg-gray-200"></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 2 ? 'bg-navy-900 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                </div>

                {step === 1 ? (
                    <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
                        <div className="space-y-6">
                            <TextInput
                                id="judul"
                                label="Judul"
                                placeholder="Masukkan Judul"
                                value={formData.judul}
                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                            />
                            <TextInput
                                id="edisi"
                                label="Edisi"
                                placeholder="Masukkan Edisi"
                                value={formData.edisi}
                                onChange={(e) => setFormData({ ...formData, edisi: e.target.value })}
                            />
                            <FileInput
                                id="cover"
                                label="Cover Gazeter"
                                onChange={(file) => setFormData({ ...formData, cover: file })}
                                icon={<Camera size={24} className="text-gray-400" />}
                                instructions="Klik untuk unggah Foto"
                            />

                            <div className="flex items-center gap-4 pt-4">
                                <Link href="/v2/big/pembuatan-gazeter" className="flex-1">
                                    <button className="w-full py-3 border border-navy-900  font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                        Batalkan
                                    </button>
                                </Link>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 py-3 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 transition-colors cursor-pointer"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Candidates Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CandidateCard title="Kandidat Jenis Unsur" items={candidateData.jenisUnsur} icon={<LayoutGrid size={16} />} />
                            <CandidateCard title="Kandidat Provinsi" items={candidateData.provinsi} icon={<LayoutGrid size={16} />} />
                            <CandidateCard title="Kandidat Kabupaten/ Kota" items={candidateData.kabupatenKota} icon={<LayoutGrid size={16} />} />
                        </div>

                        {/* Form Section */}
                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
                            <h3 className="text-lg font-bold  mb-6">Gazeter Republik Indonesia 2026</h3>
                            <div className="space-y-6">
                                <DropdownInput
                                    label="Jenis Unsur"
                                    placeholder="Pilih Jenis Unsur"
                                    value={formData.jenisUnsur}
                                    onChange={(val) => setFormData({ ...formData, jenisUnsur: val })}
                                    options={[
                                        { label: 'Candi', value: 'candi' },
                                        { label: 'Gunung', value: 'gunung' },
                                    ]}
                                />
                                <DropdownInput
                                    label="Provinsi"
                                    placeholder="Pilih Provinsi"
                                    value={formData.provinsi}
                                    onChange={(val) => setFormData({ ...formData, provinsi: val })}
                                    options={[
                                        { label: 'Jawa Barat', value: 'jb' },
                                        { label: 'Jawa Timur', value: 'jt' },
                                    ]}
                                />
                                <DropdownInput
                                    label="Kabupaten/ Kota"
                                    placeholder="Pilih Kabupaten/ Kota"
                                    value={formData.kabupatenKota}
                                    onChange={(val) => setFormData({ ...formData, kabupatenKota: val })}
                                    options={[
                                        { label: 'Kota Bandung', value: 'kb' },
                                        { label: 'Kota Surabaya', value: 'ks' },
                                    ]}
                                />

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={handlePrev}
                                        className="flex-1 py-3 border border-navy-900  font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        onClick={() => { }}
                                        className="flex-1 py-3 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 transition-colors cursor-pointer"
                                    >
                                        Buat Gazeter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

const CandidateCard = ({ title, items, icon }: { title: string; items: { name: string; count: number }[]; icon: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold ">{title}</h3>
            <div className="flex gap-2">
                <div className="p-1 bg-navy-50  rounded">{icon}</div>
                <div className="p-1 bg-gray-50 text-gray-400 rounded"><LayoutGrid size={16} /></div>
            </div>
        </div>
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-50">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm font-bold ">{item.count}</span>
                </div>
            ))}
        </div>
    </div>
);

const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3.75V14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.75 9H14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default BuatGazeterPage;
