"use client";

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GazeterData {
    no: number;
    judul: string;
    totalData: number;
    tanggalPembuatan: string;
    tanggalPenerbitan: string;
}

const PembuatanGazeterPage = () => {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const dummyData: GazeterData[] = [
        { no: 1, judul: 'Gazeter Republik Indonesia 2025', totalData: 1000, tanggalPembuatan: '01/01/2026', tanggalPenerbitan: '01/01/2026' },
        { no: 2, judul: 'Gazeter Republik Indonesia 2025', totalData: 1000, tanggalPembuatan: '01/07/2026', tanggalPenerbitan: '01/07/2026' },
        { no: 3, judul: 'Gazeter Republik Indonesia 2025', totalData: 1000, tanggalPembuatan: '01/04/2025', tanggalPenerbitan: '01/04/2025' },
        { no: 4, judul: 'Gazeter Republik Indonesia 2024', totalData: 1000, tanggalPembuatan: '01/01/2025', tanggalPenerbitan: '01/01/2025' },
        { no: 5, judul: 'Gazeter Republik Indonesia 2023', totalData: 1000, tanggalPembuatan: '01/01/2024', tanggalPenerbitan: '01/01/2024' },
        { no: 6, judul: 'Gazeter Republik Indonesia 2022', totalData: 1000, tanggalPembuatan: '01/01/2023', tanggalPenerbitan: '01/01/2023' },
        { no: 7, judul: 'Gazeter Republik Indonesia 2021', totalData: 1000, tanggalPembuatan: '01/01/2022', tanggalPenerbitan: '01/01/2022' },
        { no: 8, judul: 'Gazeter Republik Indonesia 2020', totalData: 1000, tanggalPembuatan: '01/01/2021', tanggalPenerbitan: '01/01/2021' },
        { no: 9, judul: 'Gazeter Republik Indonesia 2019', totalData: 1000, tanggalPembuatan: '01/01/2020', tanggalPenerbitan: '01/01/2020' },
        { no: 10, judul: 'Gazeter Republik Indonesia 2018', totalData: 1000, tanggalPembuatan: '01/01/2019', tanggalPenerbitan: '01/01/2019' },
    ];

    const columns: ColumnDef<GazeterData>[] = [
        { header: 'No', accessorKey: 'no', className: 'w-12' },
        {
            header: 'Foto Cover',
            cell: () => (
                <div className="w-10 h-14 bg-gray-200 rounded-md"></div>
            ),
            className: 'w-24'
        },
        { header: 'Judul Gazeter', accessorKey: 'judul' },
        { header: 'Total Data', accessorKey: 'totalData' },
        { header: 'Tanggal Pembuatan', accessorKey: 'tanggalPembuatan' },
        { header: 'Tanggal Penerbitan', accessorKey: 'tanggalPenerbitan' },
        {
            header: 'Aksi',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/v2/big/pembuatan-gazeter/${row.no}`)}
                        className="p-1.5 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail"
                    >
                        <Search size={18} />
                    </button>
                </div>
            )
        },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-[22px] font-bold text-gray-900">Gazeter</h1>
                    <Link 
                        href="/v2/big/pembuatan-gazeter/tambah"
                        className="flex items-center gap-2 bg-navy-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-700 transition"
                    >
                        <Plus size={18} /> Buat Gazeter
                    </Link>
                </div>

                <DataTable
                    columns={columns}
                    data={dummyData}
                    showSearch={true}
                    showFilter={true}
                    showDownload={false}
                    showMap={false}
                    pagination={{
                        total: 10,
                        per_page: 10,
                        current_page: page,
                        last_page: 1,
                        from: (page - 1) * 10 + 1,
                        to: page * 10,
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </DashboardLayout>
    );
};

export default PembuatanGazeterPage;