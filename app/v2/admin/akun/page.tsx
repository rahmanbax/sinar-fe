"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search } from 'lucide-react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminUsers, useOrganizations } from '@/hooks/useAdmin';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import FilterModal, { FilterField, FilterState } from '@/components/v2/modals/FilterModal';

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
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({});

    const { data: usersResponse, isLoading, refetch } = useAdminUsers(token, page, search, filters.role, filters.instansi);
    const [instansiOptions, setInstansiOptions] = useState<{label: string, value: string}[]>([]);

    useEffect(() => {
        if (!usersResponse?.data) return;
        setInstansiOptions(prev => {
            const optionsMap = new Map(prev.map(opt => [opt.value, opt]));
            usersResponse.data.forEach((user: any) => {
                if (user.organization?.id && user.organization?.name) {
                    optionsMap.set(String(user.organization.id), {
                        label: user.organization.name,
                        value: String(user.organization.id)
                    });
                }
            });
            return Array.from(optionsMap.values());
        });
    }, [usersResponse]);

    useEffect(() => {
        if (token) {
            refetch();
        }
    }, [token, refetch]);

    const filterFields: FilterField[] = [
        {
            id: 'role',
            label: 'Role',
            options: [
                { label: 'Semua Role', value: '' },
                { label: 'Admin', value: 'admin' },
                { label: 'Verifikator', value: 'verificator' },
                { label: 'Surveyor', value: 'surveyor' },
            ],
        },
        {
            id: 'instansi',
            label: 'Instansi',
            options: [
                { label: 'Semua Instansi', value: '' },
                ...instansiOptions
            ],
            searchable: true,
        },
        {
            id: 'status',
            label: 'Status',
            options: [
                { label: 'Semua Status', value: '' },
                { label: 'Aktif', value: 'aktif' },
                { label: 'Nonaktif', value: 'nonaktif' },
                { label: 'Pending', value: 'pending' },
            ],
        }
    ];


    const usersData = useMemo(() => {
        if (!usersResponse?.data) return [];
        let data = usersResponse.data.map((user: any, index: number) => ({
            id: user.id,
            no: (usersResponse.pagination?.from || 1) + index,
            nama: user.name,
            email: user.email,
            no_telp: user.phone,
            role: user.role,
            org_name: user.organization?.name || '-',
            org_id: String(user.organization?.id || ''),
            status: user.status_account_label || user.approval_status_label || (user.status_account === true ? 'Aktif' : user.status_account === false ? 'Nonaktif' : 'Pending'),
        }));

        if (filters.status) {
            data = data.filter((user: any) => user.status.toLowerCase() === filters.status.toLowerCase());
        }

        return data;
    }, [usersResponse, filters]);

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
                        <Search size={18} className="cursor-pointer transition-colors" />
                    </Link>
                </div>
            ),
            className: 'w-20 text-center',
        },
    ];

    return (
        <DashboardLayout>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Akun</h1>
                    <div className='flex gap-2'>
                        {/* <Link href="/v2/admin/akun/tambah">
                            <ButtonComponent
                                icon={<Plus size={16} />}
                                label="Tambah Akun Admin"
                            />
                        </Link> */}
                        <Link href="/v2/admin/akun/tambah-verifikator-surveyor">
                            <ButtonComponent
                                icon={<Plus size={16} />}
                                label="Tambah Verifikator/Surveyor"
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
                    onFilter={() => setIsFilterModalOpen(true)}
                    onPageChange={(newPage) => setPage(newPage)}
                    pagination={usersResponse?.pagination}
                />
            </div>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                fields={filterFields}
                initialFilters={filters}
                onApply={(newFilters) => setFilters(newFilters)}
            />
        </DashboardLayout>
    );
};

export default AdminAkunPage;
