"use client";

import React from "react";
import VerifikatorProvinsiLayout from "@/components/v2/nav/VerifikatorProvinsiLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import { Search } from "lucide-react";
import { useIncomingRecommendations } from "@/hooks/useVerificationTransactions";
import dayjs from "dayjs";
import Link from "next/link";

const DataKabupatenKotaPage = () => {
    const { data: incomingRes, isLoading } = useIncomingRecommendations();
    const recommendations = incomingRes?.data || [];

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="text-gray-900 text-center w-10">{index + 1}</div>
            ),
            className: "text-center w-10",
        },
        {
            header: "Tanggal Masuk",
            cell: (row) => (
                <div className="text-gray-900">
                    {row.created_at ? dayjs(row.created_at).format("DD/MM/YYYY") : "-"}
                </div>
            ),
            className: "min-w-[150px]",
        },
        {
            header: "Asal Kabupaten/Kota",
            cell: (row) => (
                <div className="font-semibold text-navy-900 capitalize">
                    {row.source_region_name || "-"}
                </div>
            ),
            className: "min-w-[200px]",
        },
        {
            header: "No. Surat Rekomendasi",
            cell: (row) => (
                <div className="text-gray-900">
                    {row.ref_number || row.recommendation_number || row.number || row.id || "-"}
                </div>
            ),
            className: "min-w-[220px]",
        },
        {
            header: "Jumlah Data",
            cell: (row) => (
                <div className="text-gray-900 text-center">
                    {row.toponyms_count ?? "-"}
                </div>
            ),
            className: "text-center w-32",
        },
        {
            header: "Status",
            cell: (row) => {
                const status = row.status?.toLowerCase() || "diajukan";
                const isSelesai = status === "selesai" || status === "completed";
                const isDitolak = status === "ditolak" || status === "rejected";
                
                return (
                    <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isSelesai 
                            ? "bg-green-100 text-green-600" 
                            : isDitolak
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
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
                    <Link 
                        href={`/v2/verifikator-provinsi/data-kabupaten-kota/${row.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-navy-900"
                    >
                        <Search size={18} />
                    </Link>
                </div>
            ),
            className: "text-center w-20",
        },
    ];

    return (
        <VerifikatorProvinsiLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-navy-900">Data Kabupaten/ Kota</h1>
                </div>

                <div className="bg-white rounded-xl shadow-none">
                    <DataTable
                        columns={columns}
                        data={recommendations}
                        isLoading={isLoading}
                        showSearch={true}
                        showFilter={true}
                        emptyMessage="Belum ada data dari Kabupaten/ Kota"
                    />
                </div>
            </div>
        </VerifikatorProvinsiLayout>
    );
};

export default DataKabupatenKotaPage;
