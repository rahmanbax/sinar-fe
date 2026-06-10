"use client";

import React, { useState } from "react";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { Plus, ArrowLeft, Search } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dummy data generation for detail
const dummyDetailData = Array.from({ length: 20 }).map((_, index) => {
    let status = "Belum Diproses";
    let isSuccess = false;
    let isRejected = false;
    
    if (index >= 18) {
        status = "Disetujui";
        isSuccess = true;
    } else if (index >= 16) {
        status = "Ditolak";
        isRejected = true;
    }

    return {
        id: index + 1,
        jenisUnsur: "Candi",
        namaRupabumi: "Candi Borobudur",
        provinsi: "JAWA BARAT",
        kabupatenKota: "KOTA BANDUNG",
        koordinat: "110.204, -7.608",
        status: status,
        isSuccess,
        isRejected
    };
});

export default function PengumumanDetailPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="text-gray-900">{(page - 1) * 10 + index + 1}</div>
            ),
            className: "w-14",
        },
        {
            header: "Jenis Unsur",
            accessorKey: "jenisUnsur",
            className: "min-w-[120px]",
        },
        {
            header: "Nama Rupabumi",
            accessorKey: "namaRupabumi",
            className: "min-w-[180px]",
        },
        {
            header: "Provinsi",
            accessorKey: "provinsi",
            className: "min-w-[150px]",
        },
        {
            header: "Kabupaten/ Kota",
            accessorKey: "kabupatenKota",
            className: "min-w-[150px]",
        },
        {
            header: "Koordinat",
            accessorKey: "koordinat",
            className: "min-w-[150px]",
        },
        {
            header: "Status",
            cell: (row) => {
                let statusClass = "bg-gray-100 text-gray-500";
                if (row.isSuccess) statusClass = "bg-green-100/80 text-green-600";
                if (row.isRejected) statusClass = "bg-red-100/80 text-red-600";

                return (
                    <div className="flex">
                        <span className={`px-4 py-1 rounded-full text-[13px] font-semibold ${statusClass}`}>
                            {row.status}
                        </span>
                    </div>
                );
            },
            className: "w-32",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => console.log("Detail clicked", row.id)}
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
        total: 20,
        per_page: 10,
        current_page: page,
        last_page: 2,
        from: (page - 1) * 10 + 1,
        to: page * 10
    };

    const currentData = dummyDetailData.slice((page - 1) * 10, page * 10);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
                    <Link href={`/v2/big/pengumuman/buat`}>
                        <ButtonComponent
                            label="Buat Pengumuman"
                            icon={<Plus size={20} />}
                        />
                    </Link>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Back Button and Title */}
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center gap-3 text-gray-900 font-semibold text-lg hover:text-gray-600 transition-colors w-fit"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                        <span>No. 99/ABC/2026</span>
                    </button>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">5</span>
                            <span className="text-gray-600 font-medium">Jenis Unsur</span>
                        </div>
                        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">5</span>
                            <span className="text-gray-600 font-medium">Kabupaten/ Kota</span>
                        </div>
                        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">2</span>
                            <span className="text-gray-600 font-medium">Provinsi</span>
                        </div>
                        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">20</span>
                            <span className="text-gray-600 font-medium">Total Data</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-none">
                        <DataTable
                            columns={columns}
                            data={currentData}
                            showSearch={true}
                            showFilter={true}
                            emptyMessage="Belum ada data pengumuman detail"
                            pagination={pagination}
                            onPageChange={setPage}
                            onSearch={setSearch}
                            initialSearch={search}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
