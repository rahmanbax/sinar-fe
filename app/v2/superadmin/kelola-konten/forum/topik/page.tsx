"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Eye, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminTopics, useDeleteTopicMutation } from "@/hooks/useForum";
import { ForumTopic } from "@/api/forum";

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

const TopikForumPage = () => {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const { data: response, isLoading } = useAdminTopics(token, { page, search });
    const deleteMutation = useDeleteTopicMutation();

    const handleDelete = (id: string) => {
        if (!confirm("Yakin ingin menghapus topik ini?")) return;
        deleteMutation.mutate({ token, id });
    };

    const columns: ColumnDef<ForumTopic>[] = [
        { header: "No", cell: (_, i) => (response?.pagination?.from ?? 1) + i, className: "w-14 text-center" },
        {
            header: "Judul",
            cell: (row) => (
                <Link href={`/v2/superadmin/kelola-konten/forum/topik/${row.id}`} className="hover:text-navy-600 hover:underline font-medium line-clamp-1">
                    {row.title}
                </Link>
            ),
        },
        { header: "Room", cell: (row) => <span className="text-sm text-gray-500">{row.room?.title ?? "-"}</span>, className: "w-40" },
        { header: "Pengirim", cell: (row) => <span className="text-sm">{row.author_name}</span>, className: "w-36" },
        {
            header: "Reply",
            cell: (row) => (
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                    <MessageSquare size={14} /> {row.replies_count ?? 0}
                </div>
            ),
            className: "w-20 text-center",
        },
        { header: "Tanggal", cell: (row) => <span className="text-sm text-gray-500">{formatDate(row.created_at)}</span>, className: "w-32" },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/v2/superadmin/kelola-konten/forum/topik/${row.id}`} title="Detail">
                        <Eye size={17} className="text-gray-500 hover:text-navy-600 cursor-pointer transition-colors" />
                    </Link>
                    <button onClick={() => handleDelete(row.id)} title="Hapus">
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
                        <h1 className="text-2xl font-bold">Monitor Topik Forum</h1>
                        <p className="text-sm text-gray-500 mt-1">Lihat dan kelola topik dari pengguna</p>
                    </div>
                    <Link href="/v2/superadmin/kelola-konten/forum" className="text-sm text-navy-600 hover:underline">
                        ← Kembali ke Rooms
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

export default TopikForumPage;
