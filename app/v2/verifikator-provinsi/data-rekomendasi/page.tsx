"use client";

import React, { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRecommendations } from "@/hooks/useVerificationTransactions";
import dayjs from "dayjs";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import Link from "next/link";

const DataRekomendasiPage = () => {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const { data: recommendationsRes, isLoading, refetch } = useRecommendations({ page, per_page: 10 });

    useEffect(() => {
        refetch();
    }, [page, refetch]);

    const recommendations = recommendationsRes?.data || [];
    const pagination = recommendationsRes?.pagination;

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="">{(page - 1) * 10 + index + 1}</div>
            ),
            className: "w-14 text-center",
        },
        {
            header: "Tanggal Pengajuan",
            cell: (row) => (
                <div className="">
                    {row.created_at ? dayjs(row.created_at).format("DD/MM/YYYY") : "-"}
                </div>
            ),
            className: "min-w-[150px]",
        },
        {
            header: "No. Surat Rekomendasi",
            cell: (row) => (
                <div className="">
                    {row.recommendation?.ref_number || row.ref_number || "-"}
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
                        <span className={`px-4 py-1 rounded-full text-[13px] font-semibold ${isDiajukan
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
                        onClick={() => router.push(`/v2/verifikator-provinsi/data-rekomendasi/detail?id=${row.id}`)}
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
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Data Rekomendasi</h1>
                    <Link href="/v2/verifikator-provinsi/data-rekomendasi/ajukan-rekomendasi">
                        <ButtonComponent
                            label="Ajukan Rekomendasi"
                            icon={<Plus size={20} />}
                        />
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-none">
                    <DataTable
                        columns={columns}
                        data={recommendations}
                        isLoading={isLoading}
                        showSearch={true}
                        showFilter={true}
                        emptyMessage="Belum ada data rekomendasi"
                        pagination={pagination || { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 }}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DataRekomendasiPage;
