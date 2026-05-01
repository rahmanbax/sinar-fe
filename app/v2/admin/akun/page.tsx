"use client";

import React from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/v2/nav/AdminLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search } from 'lucide-react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminUsers } from '@/hooks/useAdmin';

interface AdminAkunData {
    id: string;
    no: number;
    nama: string;
    email: string;
    no_telp: string;
    role: string;
    org_name: string;
    status: string;
}

const AdminAkunPage = () => {
    const router = useRouter();
    const { token } = useAuth();
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");

    const { data: usersResponse, isLoading } = useAdminUsers(token, page, search);

    const usersData = React.useMemo(() => {
        if (!usersResponse?.data) return [];
        return usersResponse.data.map((user: any, index: number) => ({
            id: user.id,
            no: (usersResponse.pagination?.from || 1) + index,
            nama: user.name,
            email: user.email,
            no_telp: user.phone,
            role: user.role,
            org_name: user.organization?.name || '-',
            status: user.status_account_label || user.approval_status_label || (user.status_account === true ? 'Aktif' : user.status_account === false ? 'Nonaktif' : 'Pending'),
        }));
    }, [usersResponse]);

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
            header: 'Instansi',
            accessorKey: 'org_name',
        },
        {
            header: 'Status',
            cell: (row) => {
                let badgeStyle = '';
                const status = String(row.status || '').toLowerCase();
                
                if (status === 'aktif') {
                    badgeStyle = 'bg-green-50 text-green-600';
                } else if (status === 'nonaktif' || status === 'tidak aktif') {
                    badgeStyle = 'bg-red-50 text-red-500';
                } else {
                    badgeStyle = 'bg-yellow-50 text-yellow-600';
                }

                return (
                    <span className={`px-4 py-1 rounded-full text-xs font-semibold ${badgeStyle}`}>
                        {status === 'aktif' ? 'Aktif' : (status === 'nonaktif' || status === 'tidak aktif') ? 'Nonaktif' : (row.status || 'Pending')}
                    </span>
                );
            },
            className: 'text-center',
        },
        {
            header: 'Aksi',
            cell: (row) => (
                <div className="flex justify-center">
                    <Link href={`/v2/admin/akun/${row.id}`}>
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Akun</h1>
                    <div className='flex gap-2'>
                    <Link href="/v2/admin/akun/tambah">
                        <ButtonComponent
                            icon={<Plus size={16} />}
                            label="Tambah Akun Admin"
                        />
                    </Link>
                    <Link href="/v2/admin/akun/tambah-verifikator-surveyor">
                        <ButtonComponent
                            icon={<Plus size={16} />}
                            secondary={true}
                            label="Verifikator/Surveyor"
                        />
                    </Link>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={usersData}
                    isLoading={isLoading}
                    showSearch={true}
                    showFilter={true}
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                    pagination={usersResponse?.pagination}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminAkunPage;
