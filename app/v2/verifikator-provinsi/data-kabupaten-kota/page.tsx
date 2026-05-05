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
                    {row.recommendation?.ref_number || row.ref_number || row.recommendation_number || row.number || row.id || "-"}
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
            header: "Kab/ Kota",
            cell: (row) => (
                <div className="text-gray-900 capitalize text-center">
                    {row.recommendation?.source_region?.name || row.source_region_name || "-"}
                </div>
            ),
            className: "min-w-[150px] text-center",
        },
        {
            header: "Status",
            cell: (row) => {
                const statusLower = (row.status || "").toLowerCase();
                
                const isSelesai = statusLower === "sesuai" || statusLower === "selesai" || statusLower === "completed";
                const isDitolak = statusLower === "tidak sesuai" || statusLower === "ditolak" || statusLower === "rejected";
                const isButuh = !isSelesai && !isDitolak;

                let displayStatus = "Butuh Rekomendasi";
                if (isSelesai) displayStatus = "Sesuai";
                if (isDitolak) displayStatus = "Tidak Sesuai";
                
                return (
                    <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full text-xs font-semibold ${
                            isSelesai 
                            ? "bg-green-50 text-green-500 border border-green-100" 
                            : isDitolak
                            ? "bg-red-50 text-red-500 border border-red-100"
                            : "bg-gray-50 text-gray-500 border border-gray-200"
                        }`}>
                            {displayStatus}
                        </span>
                    </div>
                );
            },
            className: "text-center w-40",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex justify-center">
                    <Link 
                        href={`/v2/verifikator-provinsi/data-kabupaten-kota/${row.id}`}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors text-navy-900"
                    >
                        <Search size={18} strokeWidth={3} />
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
