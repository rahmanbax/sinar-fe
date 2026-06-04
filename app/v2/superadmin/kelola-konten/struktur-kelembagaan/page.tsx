"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgList, useDeleteOrgNodeMutation } from "@/hooks/useCms";
import { OrgNode } from "@/api/cms";

const StrukturKelembagaanPage = () => {
    const { token } = useAuth();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: response, isLoading } = useOrgList(token);
    const deleteMutation = useDeleteOrgNodeMutation();

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Yakin ingin menghapus "${name}"? Semua anggota di bawahnya akan kehilangan parent.`)) return;
        setDeletingId(id);
        deleteMutation.mutate(
            { token, id },
            { onSettled: () => setDeletingId(null) }
        );
    };

    const columns: ColumnDef<OrgNode>[] = [
        {
            header: "No",
            cell: (_, index) => index + 1,
            className: "w-14 text-center",
        },
        {
            header: "Foto",
            cell: (row) => row.photo_url ? (
                <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-100 shrink-0">
                    <Image src={row.photo_url} alt={row.name} fill className="object-cover" />
                </div>
            ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-semibold">
                    {row.name.charAt(0).toUpperCase()}
                </div>
            ),
            className: "w-16",
        },
        {
            header: "Nama",
            accessorKey: "name",
        },
        {
            header: "Jabatan",
            accessorKey: "position",
        },
        {
            header: "Atasan",
            cell: (row) => row.parent ? (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <ChevronRight size={14} className="shrink-0" />
                    <span className="truncate">{row.parent.name}</span>
                </div>
            ) : (
                <span className="text-xs text-navy-600 font-medium bg-navy-50 px-2 py-0.5 rounded-full">
                    Root
                </span>
            ),
        },
        {
            header: "Urutan",
            accessorKey: "order",
            className: "w-20 text-center",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/v2/superadmin/kelola-konten/struktur-kelembagaan/${row.id}`}>
                        <Pencil size={17} className="text-gray-500 hover:text-navy-600 cursor-pointer transition-colors" />
                    </Link>
                    <button onClick={() => handleDelete(row.id, row.name)} disabled={deletingId === row.id}>
                        <Trash2 size={17} className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors" />
                    </button>
                </div>
            ),
            className: "w-24 text-center",
        },
    ];

    return (
        <DashboardLayout>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Struktur Kelembagaan</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola data anggota dan hierarki organisasi</p>
                    </div>
                    <Link href="/v2/superadmin/kelola-konten/struktur-kelembagaan/tambah">
                        <ButtonComponent icon={<Plus size={16} />} label="Tambah Anggota" />
                    </Link>
                </div>

                <DataTable
                    columns={columns}
                    data={response?.data ?? []}
                    isLoading={isLoading}
                    showSearch={false}
                    showFilter={false}
                />
            </div>
        </DashboardLayout>
    );
};

export default StrukturKelembagaanPage;
