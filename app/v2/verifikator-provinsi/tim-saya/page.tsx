"use client";

import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext';
import { useMyTeams } from '@/hooks/usePersonal';

interface TeamMember {
    no: number;
    id: string;
    nama: string;
    email: string;
    no_telp: string;
    role: string;
    organisasi: string;
}

const columns: ColumnDef<TeamMember>[] = [
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
        header: 'No. Telepon',
        accessorKey: 'no_telp',
    },
    {
        header: 'Role',
        accessorKey: 'role',
    },
    {
        header: 'Instansi',
        accessorKey: 'organisasi',
    },
];

const TimSayaPage = () => {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const { data: teamsResponse, isLoading } = useMyTeams(token, page, search);

    const teamData = useMemo(() => {
        if (!teamsResponse?.data) return [];
        const from = teamsResponse.pagination?.from || 1;
        return teamsResponse.data.map((member: any, index: number) => ({
            no: from + index,
            id: member.id,
            nama: member.name,
            email: member.email,
            no_telp: member.phone,
            role: member.role,
            organisasi: member.organization,
        }));
    }, [teamsResponse]);

    return (
        <DashboardLayout>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Tim Saya</h1>
                </div>

                <DataTable
                    columns={columns}
                    data={teamData}
                    isLoading={isLoading}
                    showSearch={true}
                    showFilter={true}
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                    pagination={teamsResponse?.pagination}
                />
            </div>
        </DashboardLayout>
    )
}

export default TimSayaPage;