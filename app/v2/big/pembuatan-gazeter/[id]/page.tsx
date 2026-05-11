"use client";

import React from 'react';
import { Plus, Search, ChevronLeft } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { useRouter } from 'next/navigation';

interface GazeterDetailData {
    no: number;
    tanggalDiajukan: string;
    jenisUnsur: string;
    namaRupabumi: string;
    provinsi: string;
    kabupatenKota: string;
    koordinat: string;
}

const GazeterDetailPage = () => {
    const router = useRouter();

    const dummyData: GazeterDetailData[] = Array.from({ length: 10 }).map((_, i) => ({
        no: i + 1,
        tanggalDiajukan: '05/02/2026',
        jenisUnsur: 'Candi',
        namaRupabumi: 'Candi Borobudur',
        provinsi: 'JAWA BARAT',
        kabupatenKota: 'KOTA BANDUNG',
        koordinat: '110.204, -7.608',
    }));

    const columns: ColumnDef<GazeterDetailData>[] = [
        { header: 'No', accessorKey: 'no', className: 'w-12' },
        { header: 'Tanggal Diajukan', accessorKey: 'tanggalDiajukan' },
        { header: 'Jenis Unsur', accessorKey: 'jenisUnsur' },
        { header: 'Nama Rupabumi', accessorKey: 'namaRupabumi' },
        { header: 'Provinsi', accessorKey: 'provinsi' },
        { header: 'Kabupaten/ Kota', accessorKey: 'kabupatenKota' },
        { header: 'Koordinat', accessorKey: 'koordinat' },
        {
            header: 'Aksi',
            cell: () => (
                <button className="p-1 hover:bg-gray-100 rounded transition cursor-pointer">
                    <Search size={18} className="" />
                </button>
            ),
            className: 'w-16 text-center'
        },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold ">Pembuatan GRI</h1>
                <ButtonComponent
                    label="Buat Gazeter"
                    icon={<Plus size={18} />}
                    onClick={() => { }}
                />
            </div>

            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
                >
                    <ChevronLeft size={24} className="" />
                </button>
                <h2 className="text-lg font-bold ">Gazeter Republic Indonesia 2025</h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-2 md:p-4">
                <DataTable
                    columns={columns}
                    data={dummyData}
                    showSearch={true}
                    showFilter={true}
                    pagination={{
                        total: 20,
                        per_page: 10,
                        current_page: 1,
                        last_page: 2,
                        from: 1,
                        to: 10,
                    }}
                />
            </div>
        </DashboardLayout>
    );
};

export default GazeterDetailPage;
