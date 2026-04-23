"use client";

import React, { Suspense } from "react";
import VerifikatorKotaLayout from "@/components/v2/nav/VerifikatorKotaLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const TransactionToponymsContent = () => {
    const router = useRouter();

    // DUMMY DATA: Static data matching the visual in Gambar 1
    const dummyToponyms: any[] = Array.from({ length: 10 }).map((_, idx) => ({
        id: idx + 1,
        no: idx + 1,
        date: "05/02/2026",
        element: "Candi",
        name: "Candi Borobudur",
        province: "JAWA BARAT",
        city: "KOTA BANDUNG",
        surveyor: "Mamat",
        assignedTo: "Admin 1",
        coordinates: "110.204, -7.608",
    }));

    const columns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal Pengajuan", accessorKey: "date", className: "w-32 text-gray-900" },
        { header: "Jenis Unsur", accessorKey: "element", className: "text-gray-900" },
        { header: "Nama Rupabumi", accessorKey: "name", className: "text-gray-900 font-bold" },
        { header: "Provinsi", accessorKey: "province", className: "text-gray-900" },
        { header: "Kabupaten/ Kota", accessorKey: "city", className: "text-gray-900" },
        { header: "Surveyor", accessorKey: "surveyor", className: "text-gray-900" },
        { header: "Ditugaskan ke", accessorKey: "assignedTo", className: "text-gray-900 font-bold" },
        { header: "Koordinat", accessorKey: "coordinates", className: "text-gray-900" },
        {
            header: "Aksi",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() =>
                            router.push(
                                `/v2/verifikator-kota/data-penelaahan/detail/${row.id}`
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
            {/* Breadcrumb / Title Section per Gambar 1 */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} className="text-gray-900" />
                </button>
                <div className="flex items-center gap-1 text-lg font-bold">
                    <span className="text-gray-900 font-bold">SR-VRK-BDG-002</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-bold">Penelaahan SPBU Shell Cisitu</span>
                </div>
            </div>

            {/* Table Section - Identical to Main Page */}
            <div className="bg-white rounded-xl shadow-none border-none">
                <DataTable
                    columns={columns}
                    data={dummyToponyms}
                    isLoading={false}
                    showSearch={true}
                    showFilter={true}
                    emptyMessage="Tidak ada data penelaahan ditemukan"
                    pagination={{
                        total: 2000,
                        per_page: 10,
                        current_page: 1,
                        last_page: 200,
                        from: 1,
                        to: 10
                    }}
                />
            </div>
        </div>
    );
};

const TransactionToponymsPage = () => {
    return (
        <VerifikatorKotaLayout>
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
        </VerifikatorKotaLayout>
    );
};

export default TransactionToponymsPage;
