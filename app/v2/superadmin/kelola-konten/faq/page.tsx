"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useFaqList, useDeleteFaqMutation } from "@/hooks/useCms";
import { FaqItem } from "@/api/cms";

const FaqPage = () => {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: response, isLoading } = useFaqList(token, page, search);
    const deleteMutation = useDeleteFaqMutation();

    const handleDelete = (id: string) => {
        if (!confirm("Yakin ingin menghapus FAQ ini?")) return;
        setDeletingId(id);
        deleteMutation.mutate(
            { token, id },
            { onSettled: () => setDeletingId(null) }
        );
    };

    const columns: ColumnDef<FaqItem>[] = [
        {
            header: "No",
            cell: (_, index) => (response?.pagination?.from ?? 1) + index,
            className: "w-16 text-center",
        },
        {
            header: "Pertanyaan",
            cell: (row) => (
                <span className="line-clamp-2">{row.question}</span>
            ),
        },
        {
            header: "Jawaban",
            cell: (row) => (
                <span
                    className="line-clamp-2 text-gray-500 text-sm"
                    dangerouslySetInnerHTML={{ __html: row.answer }}
                />
            ),
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
                    <Link href={`/v2/superadmin/kelola-konten/faq/${row.id}`}>
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
                        <h1 className="text-2xl font-bold">FAQ</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola pertanyaan yang sering diajukan</p>
                    </div>
                    <Link href="/v2/superadmin/kelola-konten/faq/tambah">
                        <ButtonComponent icon={<Plus size={16} />} label="Tambah FAQ" />
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

export default FaqPage;
