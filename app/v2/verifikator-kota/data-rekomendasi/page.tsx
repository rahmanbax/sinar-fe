"use client";

import React from "react";
import VerifikatorKotaLayout from "@/components/v2/nav/VerifikatorKotaLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { Plus, Search } from "lucide-react";

import { useRouter } from "next/navigation";

// Dummy Data matches the image
const dummyData = [
    { id: "1", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Diajukan" },
    { id: "2", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Diajukan" },
    { id: "3", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Diajukan" },
    { id: "4", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Diajukan" },
    { id: "5", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Diajukan" },
    { id: "6", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Diajukan" },
    { id: "7", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Diajukan" },
    { id: "8", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Selesai" },
    { id: "9", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Selesai" },
    { id: "10", submitted_at: "05/02/2026", recommendation_number: "Rekomendasi Februari", total_data: 20, status: "Selesai" },
];

const DataRekomendasiPage = () => {
    const router = useRouter();

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="text-gray-900">{index + 1}</div>
            ),
            className: "w-14 text-center",
        },
        {
            header: "Tanggal Pengajuan",
            accessorKey: "submitted_at",
            className: "min-w-[150px]",
        },
        {
            header: "No. Surat Rekomendasi",
            accessorKey: "recommendation_number",
            className: "min-w-[250px]",
        },
        {
            header: "Jumlah Data",
            accessorKey: "total_data",
            className: "text-center w-32",
        },
        {
            header: "Status",
            cell: (row) => {
                const isDiajukan = row.status === "Diajukan";
                const isSelesai = row.status === "Selesai";
                
                return (
                    <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full text-[13px] font-semibold ${
                            isDiajukan 
                            ? "bg-blue-100/80 text-blue-600" 
                            : isSelesai 
                            ? "bg-green-100/80 text-green-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                            {row.status}
                        </span>
                    </div>
                );
            },
            className: "text-center w-32",
        },
        {
            header: "Aksi",
            cell: () => (
                <div className="flex justify-center">
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                        <Search size={18} className="text-gray-900" strokeWidth={3} />
                    </button>
                </div>
            ),
            className: "w-24 text-center",
        },
    ];

    return (
        <VerifikatorKotaLayout>
            <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Data Rekomendasi</h1>
                    <ButtonComponent
                        label="Ajukan Rekomendasi"
                        onClick={() => router.push("/v2/verifikator-kota/data-rekomendasi/ajukan-rekomendasi")}
                        icon={<Plus size={18} />}
                        className="bg-navy-900 hover:bg-navy-800 rounded-md scale-95"
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-none">
                    <DataTable
                        columns={columns}
                        data={dummyData}
                        isLoading={false}
                        pagination={{
                            total: 10,
                            per_page: 10,
                            current_page: 1,
                            last_page: 1,
                            from: 1,
                            to: 10
                        }}
                        showSearch={true}
                        showFilter={true}
                        emptyMessage="Belum ada data rekomendasi"
                    />
                </div>
            </div>
        </VerifikatorKotaLayout>
    );
};

export default DataRekomendasiPage;
