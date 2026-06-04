"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useUserGuideList, useDeleteUserGuideMutation } from "@/hooks/useCms";
import { UserGuideItem } from "@/api/cms";

const PetunjukPenggunaanPage = () => {
    const { token } = useAuth();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: response, isLoading } = useUserGuideList(token);
    const deleteMutation = useDeleteUserGuideMutation();

    const handleDelete = (id: string) => {
        if (!confirm("Yakin ingin menghapus petunjuk ini?")) return;
        setDeletingId(id);
        deleteMutation.mutate(
            { token, id },
            { onSettled: () => setDeletingId(null) }
        );
    };

    const columns: ColumnDef<UserGuideItem>[] = [
        {
            header: "No",
            cell: (_, index) => index + 1,
            className: "w-16 text-center",
        },
        {
            header: "Judul",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400 shrink-0" />
                    <span>{row.title}</span>
                </div>
            ),
        },
        {
            header: "File PDF",
            cell: (row) => (
                <a
                    href={row.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-navy-600 hover:underline text-sm"
                >
                    <ExternalLink size={14} />
                    Lihat PDF
                </a>
            ),
            className: "text-center",
        },
        {
            header: "Urutan",
            accessorKey: "order",
            className: "w-24 text-center",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/v2/superadmin/kelola-konten/petunjuk-penggunaan/${row.id}`}>
                        <Pencil
                            size={17}
                            className="text-gray-500 hover:text-navy-600 cursor-pointer transition-colors"
                        />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                    >
                        <Trash2
                            size={17}
                            className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors"
                        />
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
                        <h1 className="text-2xl font-bold">Petunjuk Penggunaan</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola dokumen petunjuk penggunaan aplikasi</p>
                    </div>
                    <Link href="/v2/superadmin/kelola-konten/petunjuk-penggunaan/tambah">
                        <ButtonComponent icon={<Plus size={16} />} label="Tambah Petunjuk" />
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

export default PetunjukPenggunaanPage;
