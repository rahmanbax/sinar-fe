"use client";

import React, { Suspense, useState, useMemo } from "react";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { ArrowLeft, Search, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerificationTransactionToponyms } from "@/hooks/useVerification";
import { useProvinces, useCities } from "@/hooks/useRegions";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";

const TransactionToponymsContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const transactionId = searchParams.get("transactionId") || "";
    const transactionTitle = searchParams.get("transactionTitle") || "Detail Transaksi";
    const rekomendasiId = searchParams.get("rekomendasiId") || "";
    const refNumber = searchParams.get("refNumber") || transactionId;

    const { token } = useAuth();

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const { data: response, isLoading } = useVerificationTransactionToponyms(
        token,
        transactionId,
        { page, per_page: perPage }
    );

    const toponyms = response?.data || [];
    const pagination = response?.pagination;

    // Get region names from hooks based on the first item's IDs (since Verifikator Kota handles 1 city)
    const firstProvinceId = toponyms.length > 0 ? toponyms[0].province_id : null;
    const { data: provincesRes } = useProvinces(token);
    const firstProvincePath = provincesRes?.data?.find(p => p.code === firstProvinceId)?.path || null;
    const { data: citiesRes } = useCities(firstProvincePath, token);

    const getProvinceName = (id: string) => {
        return provincesRes?.data?.find(p => p.code === id)?.name || id || "-";
    };
    const getRegencyName = (id: string) => {
        return citiesRes?.data?.find(c => c.code === id)?.name || id || "-";
    };

    const mappedData = useMemo(() => {
        return toponyms.map((item: any, index: number) => {
            const coordinate = item.location_point?.coordinates
                ? `${item.location_point.coordinates[0].toFixed(5)}, ${item.location_point.coordinates[1].toFixed(5)}`
                : "-";

            let assignedTo = "-";
            if (item.review_transaction_toponyms && item.review_transaction_toponyms.length > 0) {
                assignedTo = item.review_transaction_toponyms[0].user?.name || "-";
            }

            return {
                ...item,
                no: index + 1 + (page - 1) * perPage,
                date: item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY") : "-",
                element_name: item.element?.name || "-",
                nama_rupabumi: item.map_name || item.local_name || "-",
                province_name: item.province_name || item.province?.name || getProvinceName(item.province_id),
                regency_name: item.regency_name || item.regency?.name || getRegencyName(item.regency_id),
                surveyor_name: item.creator?.name || "-",
                assigned_to: assignedTo,
                coordinates_str: coordinate,
            };
        });
    }, [toponyms, page, perPage, provincesRes, citiesRes]);

    const columns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal Pengajuan", accessorKey: "date", className: "w-32 text-gray-900" },
        { header: "Jenis Unsur", accessorKey: "element_name", className: "text-gray-900" },
        { header: "Nama Rupabumi", accessorKey: "nama_rupabumi", className: "text-gray-900" },
        { header: "Provinsi", accessorKey: "province_name", className: "text-gray-900" },
        { header: "Kabupaten/ Kota", accessorKey: "regency_name", className: "text-gray-900" },
        { header: "Surveyor", accessorKey: "surveyor_name", className: "text-gray-900" },
        { header: "Ditugaskan ke", accessorKey: "assigned_to", className: "text-gray-900" },
        { header: "Koordinat", accessorKey: "coordinates_str", className: "text-gray-900" },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() =>
                            router.push(
                                `/v2/verifikator-kota/data-rekomendasi/detail/toponyms/${row.id}?transactionId=${transactionId}&rekomendasiId=${rekomendasiId}`
                            )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
                        <Search
                            size={18}
                            className=""
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
                            "/v2/verifikator-kota/data-rekomendasi/ajukan-rekomendasi"
                        )
                    }
                    icon={<Plus size={18} />}
                    className="bg-navy-900 hover:bg-navy-800 rounded-md scale-95"
                />
            </div>

            {/* Breadcrumb / Title Section */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push(`/v2/verifikator-kota/data-rekomendasi/detail?id=${rekomendasiId}`)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border border-gray-200"
                >
                    <ArrowLeft size={20} className="text-gray-900" />
                </button>
                <div className="flex items-center gap-1 text-lg font-bold">
                    <span className="text-gray-900 font-bold">{refNumber}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-bold">{transactionTitle}</span>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-none">
                <DataTable
                    columns={columns}
                    data={mappedData}
                    isLoading={isLoading}
                    showSearch={true}
                    showFilter={true}
                    emptyMessage="Tidak ada data penelaahan ditemukan"
                    pagination={pagination ? {
                        total: pagination.total,
                        per_page: pagination.per_page,
                        current_page: pagination.current_page,
                        last_page: pagination.last_page,
                        from: pagination.from,
                        to: pagination.to
                    } : undefined}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </div>
    );
};

const TransactionToponymsPage = () => {
    return (
        <DashboardLayout>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-400 animate-pulse font-medium">
                            Memuat daftar penelaahan...
                        </p>
                    </div>
                }
            >
                <TransactionToponymsContent />
            </Suspense>
        </DashboardLayout>
    );
};

export default TransactionToponymsPage;
