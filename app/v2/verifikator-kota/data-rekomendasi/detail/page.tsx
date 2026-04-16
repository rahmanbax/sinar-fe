"use client";

import React, { Suspense } from "react";
import VerifikatorKotaLayout from "@/components/v2/nav/VerifikatorKotaLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { Plus, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const DetailRekomendasiContent = () => {
    const router = useRouter();

    // DUMMY DATA: Pure static data for UI presentation
    const dummyTransactions: any[] = [
        {
            id: "k7qXLPMTN",
            title: "Penelaahan SPBU Shell",
            due_at: "2026-04-30T00:00:00Z",
            total_data: 50,
            accepted_data: 48,
            rejected_data: 2,
        }
    ];

    const recommendationTitle = "SR-VRK-BDG-002"; 

    const columns: ColumnDef<any>[] = [
        {
            header: "No",
            cell: (_, index) => (
                <div className="text-gray-900 text-center">{index + 1}</div>
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
                <div className="font-medium text-navy-900">{row.title || "-"}</div>
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
                                `/v2/verifikator-kota/data-rekomendasi/detail/toponyms`
                            )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
                        <Search
                            size={18}
                            className="text-navy-900"
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
                <h1 className="text-2xl font-bold text-navy-900">
                    Data Rekomendasi
                </h1>
                <ButtonComponent
                    label="Ajukan Rekomendasi"
                    onClick={() =>
                        router.push(
                            "/v2/verifikator-kota/data-rekomendasi/ajukan-rekomendasi"
                        )
                    }
                    icon={<Plus size={18} />}
                    className="bg-navy-900 hover:bg-navy-800 rounded-md scale-95"
                />
            </div>

            {/* Title Section */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() =>
                        router.push("/v2/verifikator-kota/data-rekomendasi")
                    }
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} className="text-gray-900" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-navy-900">
                        {recommendationTitle}
                    </h2>
                    <p className="text-xs text-gray-400">Detail transaksi dalam rekomendasi ini</p>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={dummyTransactions}
                    isLoading={false}
                    showSearch={true}
                    showFilter={true}
                    emptyMessage="Tidak ada transaksi ditemukan dalam rekomendasi ini"
                />
            </div>
        </div>
    );
};

const DetailRekomendasiPage = () => {
    return (
        <VerifikatorKotaLayout>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-400 animate-pulse font-medium">
                            Memuat Detail...
                        </p>
                    </div>
                }
            >
                <DetailRekomendasiContent />
            </Suspense>
        </VerifikatorKotaLayout>
    );
};

export default DetailRekomendasiPage;
