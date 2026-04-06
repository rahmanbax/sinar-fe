"use client";

import React from 'react';
import VerifikatorProvinsiLayout from '@/components/v2/nav/VerifikatorProvinsiLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Search } from 'lucide-react';

interface AkunData {
    no: number;
    nama: string;
    email: string;
    no_telp: string;
    status: 'Aktif' | 'Nonaktif';
}

const AkunPage = () => {
    // Hardcoded dummy data based on Image 4
    const dummyData: AkunData[] = [
        { 
            no: 1, 
            nama: 'Admin 1', 
            email: 'admin1@gmail.com', 
            no_telp: '081234567890', 
            status: 'Aktif' 
        },
        { 
            no: 2, 
            nama: 'Admin 2', 
            email: 'admin2@gmail.com', 
            no_telp: '081234567891', 
            status: 'Nonaktif' 
        },
    ];

    const columns: ColumnDef<AkunData>[] = [
        {
            header: 'No',
            accessorKey: 'no',
            className: 'w-16 text-center',
        },
        {
            header: 'Nama',
            accessorKey: 'nama',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'No. Telepon WhatsApp',
            accessorKey: 'no_telp',
        },
        {
            header: 'Status',
            cell: (row) => {
                const badgeStyle = row.status === 'Aktif'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-500';
                
                return (
                    <span className={`px-4 py-1 rounded-full text-xs font-semibold ${badgeStyle}`}>
                        {row.status}
                    </span>
                );
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
        <VerifikatorProvinsiLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-navy-900 mb-6">Akun</h1>
                
                <DataTable 
                    columns={columns} 
                    data={dummyData}
                    showSearch={true}
                    showFilter={true}
                    pagination={{
                        total: 2,
                        per_page: 10,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: 2
                    }}
                />
            </div>
        </VerifikatorProvinsiLayout>
    );
};

export default AkunPage;
