"use client";

import React from "react";
import VerifikatorKotaLayout from "@/components/v2/nav/VerifikatorKotaLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { Plus, Search } from "lucide-react";    

import { useRouter } from "next/navigation";

import { useRecommendations } from "@/hooks/useVerificationTransactions";
import dayjs from "dayjs";

const DataRekomendasiPage = () => {
    const router = useRouter();
    const { data: recommendationsRes, isLoading } = useRecommendations();
    
    const recommendations = recommendationsRes?.data || [];

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
            cell: (row) => (
                <div className="text-gray-900">
                    {row.created_at ? dayjs(row.created_at).format("DD/MM/YYYY") : "-"}
                </div>
            ),
            className: "min-w-[150px]",
        },
        {
            header: "No. Surat Rekomendasi",
            cell: (row) => (
                <div className="text-gray-900">
                    {row.ref_number || "-"}
                </div>
            ),
            className: "min-w-[250px]",
        },
        {
            header: "Jumlah Data",
            cell: (row) => (
                <div className="text-gray-900 text-center">
                    {row.toponyms_count ?? row.total_data ?? "-"}
                </div>
            ),
            className: "text-center w-32",
        },
        {
            header: "Status",
            cell: (row) => {
                const isDiajukan = row.status === "Diajukan" || row.status === "diajukan" || !row.status;
                const isSelesai = row.status === "Selesai" || row.status === "selesai";
                
                return (
                    <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full text-[13px] font-semibold ${
                            isDiajukan 
                            ? "bg-blue-100/80 text-blue-600" 
                            : isSelesai 
                            ? "bg-green-100/80 text-green-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                            {row.status || "Diajukan"}
                        </span>
                    </div>
                );
            },
            className: "text-center w-32",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex justify-center">
                    <button 
                        onClick={() => router.push(`/v2/verifikator-kota/data-rekomendasi/detail?id=${row.id}`)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
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
                        data={recommendations}
                        isLoading={isLoading}
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
