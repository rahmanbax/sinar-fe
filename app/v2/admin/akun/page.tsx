"use client";

import React from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/v2/nav/AdminLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Search } from 'lucide-react';

interface AdminAkunData {
    no: number;
    nama: string;
    email: string;
    no_telp: string;
    role: string;
    status: 'Aktif' | 'Nonaktif';
}

const AdminAkunPage = () => {
    // Dummy data based on Image 1
    const dummyData: AdminAkunData[] = [
        { 
            no: 1, 
            nama: 'Admin BIG', 
            email: 'big@gmail.com', 
            no_telp: '081234567890', 
            role: 'Admin BIG',
            status: 'Aktif' 
        },
        { 
            no: 2, 
            nama: 'Admin Kota', 
            email: 'adminkota@gmail.com', 
            no_telp: '081234567891', 
            role: 'Admin Kota',
            status: 'Nonaktif' 
        },
    ];

    const columns: ColumnDef<AdminAkunData>[] = [
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
            header: 'Role',
            accessorKey: 'role',
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
                    <Link href="/v2/admin/akun/detail">
                        <Search size={18} className="text-navy-900 cursor-pointer hover:text-navy-700 transition-colors" />
                    </Link>
                </div>
            ),
            className: 'w-20 text-center',
        },
    ];

    return (
        <AdminLayout>
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
        </AdminLayout>
    );
};

export default AdminAkunPage;
