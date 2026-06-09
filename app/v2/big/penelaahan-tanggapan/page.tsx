"use client"

import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import React, { useState } from 'react'
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface TanggapanData {
    id: number;
    jenisUnsur: string;
    namaRupabumi: string;
    provinsi: string;
    kabupatenKota: string;
    koordinat: string;
    status: string;
}

const dummyData: TanggapanData[] = Array.from({ length: 10 }).map((_, i) => {
    let status = '0 Tanggapan';
    if (i === 6 || i === 7) {
        status = '1 Tanggapan';
    }
    return {
        id: i + 1,
        jenisUnsur: 'Candi',
        namaRupabumi: 'Candi Borobudur',
        provinsi: 'JAWA BARAT',
        kabupatenKota: 'KOTA BANDUNG',
        koordinat: '110.204, -7.608',
        status: status
    };
});

const columns: ColumnDef<TanggapanData>[] = [
    { header: "No", accessorKey: "id" },
    { header: "Jenis Unsur", accessorKey: "jenisUnsur" },
    { header: "Nama Rupabumi", accessorKey: "namaRupabumi" },
    { header: "Provinsi", accessorKey: "provinsi" },
    { header: "Kabupaten/ Kota", accessorKey: "kabupatenKota" },
    { header: "Koordinat", accessorKey: "koordinat" },
    { 
        header: "Status", 
        cell: (row) => (
            <span className={`px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap ${
                row.status === '0 Tanggapan' 
                ? 'bg-gray-100 text-gray-500' 
                : 'bg-orange-100 text-orange-600'
            }`}>
                {row.status}
            </span>
        ) 
    },
    {
        header: "Aksi",
        cell: (row) => (
            <div className="flex items-center gap-2">
                <Link href={`/v2/big/penelaahan-tanggapan/${row.id}`}>
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

export default function PenelaahanTanggapanPage() {
    const [page, setPage] = useState(1);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-[22px] font-bold text-gray-900">Tanggapan</h1>
                
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
                        to: page * 10
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </DashboardLayout>
    )
}