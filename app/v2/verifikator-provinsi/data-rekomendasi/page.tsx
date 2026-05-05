"use client";

import React from 'react';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Search } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

interface RekomendasiData {
    no: number;
    tanggal_pengajuan: string;
    no_surat: string;
    jumlah_data: number;
    kab_kota: string;
    status: 'Butuh Rekomendasi' | 'Tidak Sesuai' | 'Sesuai';
}

const DataRekomendasiPage = () => {
    // Hardcoded dummy data based on Image 3
    const dummyData: RekomendasiData[] = [
        { no: 1, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Butuh Rekomendasi' },
        { no: 2, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Butuh Rekomendasi' },
        { no: 3, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Butuh Rekomendasi' },
        { no: 4, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Butuh Rekomendasi' },
        { no: 5, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Butuh Rekomendasi' },
        { no: 6, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Butuh Rekomendasi' },
        { no: 7, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Butuh Rekomendasi' },
        { no: 8, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Tidak Sesuai' },
        { no: 9, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Sesuai' },
        { no: 10, tanggal_pengajuan: '05/02/2026', no_surat: 'No. 12/KBI/JTM/2020', jumlah_data: 100, kab_kota: 'Kota Bandung', status: 'Sesuai' },
    ];

    const columns: ColumnDef<RekomendasiData>[] = [
        {
            header: 'No',
            accessorKey: 'no',
            className: 'w-12 text-center',
        },
        {
            header: 'Tanggal Pengajuan',
            accessorKey: 'tanggal_pengajuan',
        },
        {
            header: 'No. Surat Rekomendasi',
            accessorKey: 'no_surat',
        },
        {
            header: 'Jumlah Data',
            accessorKey: 'jumlah_data',
            className: 'text-center',
        },
        {
            header: 'Kab/ Kota',
            accessorKey: 'kab_kota',
        },
        {
            header: 'Status',
            cell: (row) => {
                const statusStyles = {
                    'Butuh Rekomendasi': 'bg-gray-100 text-gray-500',
                    'Tidak Sesuai': 'text-red-500 font-bold',
                    'Sesuai': 'bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-semibold'
                };
                
                if (row.status === 'Tidak Sesuai') {
                    return <span className={statusStyles[row.status]}>{row.status}</span>;
                }

                if (row.status === 'Butuh Rekomendasi') {
                    return (
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold">
                            {row.status}
                        </span>
                    );
                }

                return <span className={statusStyles[row.status]}>{row.status}</span>;
            },
            className: 'text-center',
        },
        {
            header: 'Aksi',
            cell: () => (
                <div className="flex justify-center">
                    <Search size={18} className="text-navy-900 cursor-pointer hover:text-navy-700 transition-colors" />
                </div>
            ),
            className: 'w-20 text-center',
        },
    ];

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-navy-900 mb-6">Data Rekomendasi</h1>
                
                <DataTable 
                    columns={columns} 
                    data={dummyData}
                    showSearch={true}
                    showFilter={true}
                    pagination={{
                        total: 100,
                        per_page: 10,
                        current_page: 1,
                        last_page: 10,
                        from: 1,
                        to: 10
                    }}
                />
            </div>
        </DashboardLayout>
    );
};

export default DataRekomendasiPage;
