"use client";

import React, { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import { Search } from "lucide-react";
import { useIncomingRecommendations } from "@/hooks/useVerificationTransactions";
import dayjs from "dayjs";
import Link from "next/link";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";

const DataKabupatenKotaPage = () => {
    const [page, setPage] = useState(1);

    const { data: incomingRes, isLoading, refetch } = useIncomingRecommendations({ page, per_page: 10 });

    useEffect(() => {
        refetch();
    }, [page, refetch]);

    const recommendations = incomingRes?.data || [];
    const pagination = incomingRes?.pagination;

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="text-gray-900 text-center w-10">{(page - 1) * 10 + index + 1}</div>
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
                const isButuh = row.accepted === null;
                const displayStatus = isButuh ? "Butuh Rekomendasi" : "Rekomendasi Pusat";

                return (
                    <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full text-xs font-semibold ${isButuh
                                ? "bg-gray-50 text-gray-500 border border-gray-200"
                                : "bg-green-50 text-green-500 border border-green-100"
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
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors "
                    >
                        <Search size={18} strokeWidth={3} />
                    </Link>
                </div>
            ),
            className: "text-center w-20",
        },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold ">Data Kabupaten/ Kota</h1>
                </div>

                <div className="bg-white rounded-xl shadow-none">
                    <DataTable
                        columns={columns}
                        data={recommendations}
                        isLoading={isLoading}
                        showSearch={true}
                        showFilter={true}
                        emptyMessage="Belum ada data dari Kabupaten/ Kota"
                        pagination={pagination || { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 }}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DataKabupatenKotaPage;
