"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useNewsList, useDeleteNewsMutation } from "@/hooks/useCms";
import { NewsItem } from "@/api/cms";

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const BeritaPage = () => {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: response, isLoading } = useNewsList(token, page, search, status);

    const deleteMutation = useDeleteNewsMutation();

    const handleDelete = (id: string) => {
        if (!confirm("Yakin ingin menghapus berita ini?")) return;
        setDeletingId(id);
        deleteMutation.mutate(
            { token, id },
            { onSettled: () => setDeletingId(null) }
        );
    };

    const columns: ColumnDef<NewsItem>[] = [
        {
            header: "No",
            cell: (_, index) => (response?.pagination?.from ?? 1) + index,
            className: "w-16 text-center",
        },
        {
            header: "Judul",
            accessorKey: "title",
        },
        {
            header: "Status",
            cell: (row) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.status === "published"
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-600"
                    }`}
                >
                    {row.status === "published" ? "Dipublikasi" : "Draft"}
                </span>
            ),
            className: "text-center",
        },
        {
            header: "Tanggal Dibuat",
            cell: (row) => formatDate(row.created_at),
        },
        {
            header: "Dipublikasi",
            cell: (row) => formatDate(row.published_at),
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/v2/superadmin/kelola-konten/berita/${row.id}`}>
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
                        <h1 className="text-2xl font-bold">Berita</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola konten berita aplikasi</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-300"
                        >
                            <option value="">Semua Status</option>
                            <option value="published">Dipublikasi</option>
                            <option value="draft">Draft</option>
                        </select>
                        <Link href="/v2/superadmin/kelola-konten/berita/tambah">
                            <ButtonComponent icon={<Plus size={16} />} label="Tambah Berita" />
                        </Link>
                    </div>
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

export default BeritaPage;
