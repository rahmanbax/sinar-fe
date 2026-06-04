"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useAgendaList, useDeleteAgendaMutation } from "@/hooks/useCms";
import { AgendaItem } from "@/api/cms";

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

const AgendaPage = () => {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: response, isLoading } = useAgendaList(token, page, search);
    const deleteMutation = useDeleteAgendaMutation();

    const handleDelete = (id: string) => {
        if (!confirm("Yakin ingin menghapus agenda ini?")) return;
        setDeletingId(id);
        deleteMutation.mutate(
            { token, id },
            { onSettled: () => setDeletingId(null) }
        );
    };

    const columns: ColumnDef<AgendaItem>[] = [
        {
            header: "No",
            cell: (_, index) => (response?.pagination?.from ?? 1) + index,
            className: "w-16 text-center",
        },
        {
            header: "Foto",
            cell: (row) =>
                row.photo_url ? (
                    <div className="w-16 h-12 relative rounded overflow-hidden bg-gray-100">
                        <Image
                            src={row.photo_url}
                            alt={row.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        Kosong
                    </div>
                ),
            className: "w-24",
        },
        {
            header: "Judul",
            accessorKey: "title",
        },
        {
            header: "Tanggal",
            cell: (row) => formatDate(row.date),
            className: "w-44",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/v2/superadmin/kelola-konten/agenda/${row.id}`}>
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
                        <h1 className="text-2xl font-bold">Agenda</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola agenda kegiatan</p>
                    </div>
                    <Link href="/v2/superadmin/kelola-konten/agenda/tambah">
                        <ButtonComponent icon={<Plus size={16} />} label="Tambah Agenda" />
                    </Link>
                </div>

                <DataTable
                    columns={columns}
                    data={response?.data ?? []}
                    isLoading={isLoading}
                    showSearch
                    showFilter={false}
                    onSearch={(val) => { setSearch(val); setPage(1); }}
                    pagination={response?.pagination}
                    onPageChange={setPage}
                />
            </div>
        </DashboardLayout>
    );
};

export default AgendaPage;
