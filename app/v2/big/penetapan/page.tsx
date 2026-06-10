"use client"

import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import React, { useState } from 'react'
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'

interface PenetapanData {
    id: number;
    noSk: string;
    namaGazeteer: string;
    tanggal: string;
    jumlahData: number;
}

const dummyData: PenetapanData[] = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    noSk: 'No. 99/ABC/2026',
    namaGazeteer: 'Gazeter A',
    tanggal: '05/02/2026',
    jumlahData: 100
}));

const columns: ColumnDef<PenetapanData>[] = [
    { header: "No", accessorKey: "id" },
    { header: "No. SK Penetapan", accessorKey: "noSk" },
    { header: "Nama Gazeteer", accessorKey: "namaGazeteer" },
    { header: "Tanggal Penetapan", accessorKey: "tanggal" },
    { header: "Jumlah Data", accessorKey: "jumlahData" },
    {
        header: "Aksi",
        cell: (row) => (
            <div className="flex items-center gap-2">
                <Link href={`/v2/big/penetapan/${row.id}`}>
                    <button 
                        className="p-1.5 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail"
                    >
                        <Search size={18} />
                    </button>
                </Link>
            </div>
        )
    }
];

export default function PenetapanPage() {
    const [page, setPage] = useState(1);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-[22px] font-bold text-gray-900">Penetapan</h1>
                    <Link 
                        href="/v2/big/penetapan/buat"
                        className="flex items-center gap-2 bg-navy-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-700 transition"
                    >
                        <Plus size={18} /> Buat Penetapan
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
                        to: page * 10
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </DashboardLayout>
    )
}