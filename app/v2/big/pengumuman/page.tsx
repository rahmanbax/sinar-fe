"use client";

import React, { useState } from "react";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { Plus, Search } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dummy data generation
const dummyData = Array.from({ length: 10 }).map((_, index) => ({
    id: index + 1,
    noRegistrasi: "No. 99/ABC/2026",
    tanggalMulai: "05/02/2026",
    tanggalSelesai: "05/02/2026",
    jumlahData: 100,
    status: "Status Dummy",
    // Simulate some green statuses for the last two items based on the reference image
    isSuccess: index >= 8,
}));

export default function PengumumanPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="text-gray-900">{(page - 1) * 10 + index + 1}</div>
            ),
            className: "w-14 text-center",
        },
        {
            header: "No. Registrasi",
            accessorKey: "noRegistrasi",
            className: "min-w-[150px] font-medium",
        },
        {
            header: "Tanggal Mulai",
            accessorKey: "tanggalMulai",
            className: "min-w-[150px]",
        },
        {
            header: "Tanggal Selesai",
            accessorKey: "tanggalSelesai",
            className: "min-w-[150px]",
        },
        {
            header: "Jumlah Data",
            accessorKey: "jumlahData",
            className: "text-center w-32",
            cell: (row) => (
                <div className="text-center">{row.jumlahData}</div>
            )
        },
        {
            header: "Status",
            cell: (row) => {
                const statusClass = row.isSuccess
                    ? "bg-green-100/80 text-green-600"
                    : "bg-gray-100 text-gray-500";

                return (
                    <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full text-[13px] font-semibold ${statusClass}`}>
                            {row.status}
                        </span>
                    </div>
                );
            },
            className: "w-32 text-center",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => router.push(`/v2/big/pengumuman/detail?id=${row.id}`)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
                        <Search size={18} className="text-gray-900" strokeWidth={3} />
                    </button>
                </div>
            ),
            className: "w-24 text-center",
        },
    ];

    // Dummy pagination
    const pagination = {
        total: 10,
        per_page: 10,
        current_page: page,
        last_page: 1,
        from: 1,
        to: 10
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
                    <Link href={`/v2/big/pengumuman/buat`}>
                        <ButtonComponent
                            label="Buat Pengumuman"
                            icon={<Plus size={20} />}
                        />
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-none">
                    <DataTable
                        columns={columns}
                        data={dummyData}
                        showSearch={true}
                        showFilter={true}
                        emptyMessage="Belum ada data pengumuman"
                        pagination={pagination}
                        onPageChange={setPage}
                        onSearch={setSearch}
                        initialSearch={search}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}