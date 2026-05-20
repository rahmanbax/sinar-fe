"use client";

import React, { Suspense } from "react";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { Plus, ArrowLeft, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useOutgoingRecommendationData } from "@/hooks/useVerification";
import dayjs from "dayjs";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";

const DetailRekomendasiPusatContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const { token } = useAuth();

    const { data: response, isLoading } = useOutgoingRecommendationData(token, id);

    // Metadata rekomendasi ada di key "0" berdasarkan struktur API
    const recommendationInfo = response?.recommendation ||
        (Array.isArray((response as any)?.["0"]) ? (response as any)?.["0"]?.[0] : ((response as any)?.["0"]?.recommendation || (response as any)?.["0"])) ||
        null;
    const transactions = response?.data || [];

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="text-gray-900">{index + 1}</div>
            ),
            className: "w-14 text-center",
        },
        {
            header: "Rentang Penelaahan",
            cell: (row) => (
                <div className="text-gray-900">
                    {row.due_at ? dayjs(row.due_at).format("DD/MM/YYYY") : "-"}
                </div>
            ),
            className: "min-w-[160px]",
        },
        {
            header: "Judul Penelaahan",
            cell: (row) => (
                <div className="">{row.title || "-"}</div>
            ),
            className: "min-w-[200px]",
        },
        {
            header: "Jumlah Data Ditelaah",
            cell: (row) => (
                <div className="text-gray-900 text-center">
                    {row.total_data ?? "-"}
                </div>
            ),
            className: "text-center w-40",
        },
        {
            header: "Jumlah Disetujui",
            cell: (row) => (
                <div className="text-gray-900 text-center">
                    {row.accepted_data ?? "-"}
                </div>
            ),
            className: "text-center w-36",
        },
        {
            header: "Jumlah Ditolak",
            cell: (row) => (
                <div className="text-gray-900 text-center">
                    {row.rejected_data ?? "-"}
                </div>
            ),
            className: "text-center w-36",
        },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() =>
                            router.push(
                                `/v2/verifikator-pusat/data-rekomendasi/detail/toponyms?transactionId=${row.id}&transactionTitle=${encodeURIComponent(row.title || "Transaksi")}&rekomendasiId=${id}&refNumber=${encodeURIComponent(recommendationInfo?.ref_number || "")}`
                            )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
                        <Search
                            size={18}
                            className="text-gray-900"
                            strokeWidth={3}
                        />
                    </button>
                </div>
            ),
            className: "w-24 text-center",
        },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900"> Data Rekomendasi</h1>
                <ButtonComponent
                    label="Ajukan Rekomendasi"
                    onClick={() =>
                        router.push(
                            "/v2/verifikator-pusat/data-rekomendasi/ajukan-rekomendasi"
                        )
                    }
                    icon={<Plus size={18} />}
                    className="bg-navy-900 hover:bg-navy-800 rounded-md scale-95"
                />
            </div>

            {/* Title Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() =>
                            router.push("/v2/verifikator-pusat/data-rekomendasi")
                        }
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border border-gray-200"
                    >
                        <ArrowLeft size={20} className="text-gray-900" />
                    </button>
                    <h2 className="text-xl font-bold ">
                        {isLoading ? "Memuat..." : (recommendationInfo?.ref_number || "-")}
                    </h2>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-none">
                <DataTable
                    columns={columns}
                    data={transactions}
                    isLoading={isLoading}
                    showSearch={true}
                    showFilter={true}
                    emptyMessage="Tidak ada transaksi ditemukan dalam rekomendasi ini"
                />
            </div>
        </div>
    );
};

const DetailRekomendasiPusatPage = () => {
    return (
        <DashboardLayout>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-400 animate-pulse font-medium">
                            Memuat Detail...
                        </p>
                    </div>
                }
            >
                <DetailRekomendasiPusatContent />
            </Suspense>
        </DashboardLayout>
    );
};

export default DetailRekomendasiPusatPage;
