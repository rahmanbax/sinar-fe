"use client";

import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GazeterDetailData {
    no: number;
    jenisUnsur: string;
    namaRupabumi: string;
    provinsi: string;
    kabupatenKota: string;
    koordinat: string;
}

const SummaryCard = ({ value, label }: { value: string | number, label: string }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
        <span className="font-bold text-gray-900 text-base">{value}</span>
        <span className="text-sm text-gray-600">{label}</span>
    </div>
);

const GazeterDetailPage = () => {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const dummyData: GazeterDetailData[] = Array.from({ length: 10 }).map((_, i) => ({
        no: i + 1,
        jenisUnsur: 'Candi',
        namaRupabumi: 'Candi Borobudur',
        provinsi: 'JAWA BARAT',
        kabupatenKota: 'KOTA BANDUNG',
        koordinat: '110.204, -7.608',
    }));

    const columns: ColumnDef<GazeterDetailData>[] = [
        { header: 'No', accessorKey: 'no', className: 'w-12' },
        { header: 'Jenis Unsur', accessorKey: 'jenisUnsur' },
        { header: 'Nama Rupabumi', accessorKey: 'namaRupabumi' },
        { header: 'Provinsi', accessorKey: 'provinsi' },
        { header: 'Kabupaten/ Kota', accessorKey: 'kabupatenKota' },
        { header: 'Koordinat', accessorKey: 'koordinat' },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header Area */}
                <div className="flex items-center justify-between">
                    <h1 className="text-[22px] font-bold text-gray-900">Gazeter</h1>
                    <Link 
                        href="/v2/big/pembuatan-gazeter/tambah"
                        className="flex items-center gap-2 bg-navy-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-700 transition"
                    >
                        <Plus size={18} /> Buat Gazeter
                    </Link>
                </div>

                {/* Subheader Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                    >
                        <ArrowLeft size={20} className="text-gray-900" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">Gazeter Republic Indonesia 2025</h2>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard value="5" label="Jenis Unsur" />
                    <SummaryCard value="5" label="Kabupaten/ Kota" />
                    <SummaryCard value="2" label="Provinsi" />
                    <SummaryCard value="20" label="Total Data" />
                </div>

                {/* Table Area */}
                <DataTable
                    columns={columns}
                    data={dummyData}
                    showSearch={true}
                    showFilter={true}
                    showDownload={false}
                    showMap={false}
                    pagination={{
                        total: 20,
                        per_page: 10,
                        current_page: page,
                        last_page: 2,
                        from: (page - 1) * 10 + 1,
                        to: page * 10,
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </DashboardLayout>
    );
};

export default GazeterDetailPage;
