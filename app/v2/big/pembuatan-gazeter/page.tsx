"use client";

import React from 'react';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { useRouter } from 'next/navigation';

interface GazeterData {
    no: number;
    judul: string;
    edisi: string;
    totalData: number;
    tanggalPenerbitan: string;
}

const PembuatanGazeterPage = () => {
    const router = useRouter();

    const dummyData: GazeterData[] = [
        { no: 1, judul: 'Gazeter Republik Indonesia 2025', edisi: '3', totalData: 1000, tanggalPenerbitan: '01/01/2026' },
        { no: 2, judul: 'Gazeter Republik Indonesia 2025', edisi: '2', totalData: 1000, tanggalPenerbitan: '01/07/2026' },
        { no: 3, judul: 'Gazeter Republik Indonesia 2025', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/04/2025' },
        { no: 4, judul: 'Gazeter Republik Indonesia 2024', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/01/2025' },
        { no: 5, judul: 'Gazeter Republik Indonesia 2023', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/01/2024' },
        { no: 6, judul: 'Gazeter Republik Indonesia 2022', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/01/2023' },
        { no: 7, judul: 'Gazeter Republik Indonesia 2021', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/01/2022' },
        { no: 8, judul: 'Gazeter Republik Indonesia 2020', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/01/2021' },
        { no: 9, judul: 'Gazeter Republik Indonesia 2019', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/01/2020' },
        { no: 10, judul: 'Gazeter Republik Indonesia 2018', edisi: '1', totalData: 1000, tanggalPenerbitan: '01/01/2019' },
    ];

    const columns: ColumnDef<GazeterData>[] = [
        { header: 'No', accessorKey: 'no', className: 'w-12' },
        { header: 'Judul Gazeter', accessorKey: 'judul' },
        { header: 'Edisi Gazeter', accessorKey: 'edisi' },
        { header: 'Total Data', accessorKey: 'totalData' },
        { header: 'Tanggal Penerbitan', accessorKey: 'tanggalPenerbitan' },
        {
            header: 'Aksi',
            cell: (row) => (
                <button
                    onClick={() => router.push(`/v2/big/pembuatan-gazeter/${row.no}`)}
                    className="p-1 hover:bg-gray-100 rounded transition cursor-pointer"
                >
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
                    onClick={() => router.push('/v2/big/pembuatan-gazeter/tambah')}
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-2 md:p-4">
                <DataTable
                    columns={columns}
                    data={dummyData}
                    showSearch={true}
                    showFilter={true}
                    pagination={{
                        total: 10,
                        per_page: 10,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: 10,
                    }}
                />
            </div>
        </DashboardLayout>
    );
};

export default PembuatanGazeterPage;