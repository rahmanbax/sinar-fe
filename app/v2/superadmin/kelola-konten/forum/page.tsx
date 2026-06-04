"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRooms, useDeleteRoomMutation } from "@/hooks/useForum";
import { ForumRoom } from "@/api/forum";

const ForumPage = () => {
    const { token } = useAuth();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: response, isLoading } = useAdminRooms(token);
    const deleteMutation = useDeleteRoomMutation();

    const handleDelete = (id: string, title: string) => {
        if (!confirm(`Yakin ingin menghapus room "${title}"? Semua topik di dalamnya akan ikut terhapus.`)) return;
        setDeletingId(id);
        deleteMutation.mutate({ token, id }, { onSettled: () => setDeletingId(null) });
    };

    const columns: ColumnDef<ForumRoom>[] = [
        { header: "No", cell: (_, i) => i + 1, className: "w-14 text-center" },
        { header: "Nama Room", accessorKey: "title" },
        { header: "Deskripsi", cell: (row) => <span className="text-sm text-gray-500 line-clamp-1">{row.description || "-"}</span> },
        {
            header: "Topik",
            cell: (row) => (
                <Link href={`/v2/superadmin/kelola-konten/forum/topik?room_id=${row.id}`} className="flex items-center gap-1.5 text-navy-600 hover:underline text-sm font-medium">
                    <MessageSquare size={14} /> {row.topics_count ?? 0} topik
                </Link>
            ),
            className: "w-32 text-center",
        },
        { header: "Urutan", accessorKey: "order", className: "w-20 text-center" },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/v2/superadmin/kelola-konten/forum/rooms/${row.id}`}>
                        <Pencil size={17} className="text-gray-500 hover:text-navy-600 cursor-pointer transition-colors" />
                    </Link>
                    <button onClick={() => handleDelete(row.id, row.title)} disabled={deletingId === row.id}>
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
                        <h1 className="text-2xl font-bold">Forum</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola room forum dan monitor topik dari pengguna</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/v2/superadmin/kelola-konten/forum/topik">
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <MessageSquare size={16} /> Monitor Topik
                            </button>
                        </Link>
                        <Link href="/v2/superadmin/kelola-konten/forum/rooms/tambah">
                            <ButtonComponent icon={<Plus size={16} />} label="Tambah Room" />
                        </Link>
                    </div>
                </div>

                <DataTable columns={columns} data={response?.data ?? []} isLoading={isLoading} showSearch={false} showFilter={false} />
            </div>
        </DashboardLayout>
    );
};

export default ForumPage;
