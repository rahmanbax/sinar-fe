"use client";

import PublicLayout from '@/components/v2/nav/PublicLayout'
import React from 'react'
import { usePublicToponyms, PublicToponym } from '@/hooks/useToponyms'
import { Eye, Download, Search } from 'lucide-react'
import { useState } from 'react'
import dayjs from 'dayjs'
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';

// Table Columns Definition
const generateColumns = (currentPage: number, perPage: number = 10): ColumnDef<PublicToponym>[] => [
    {
        header: "No",
        cell: (_, index) => (currentPage - 1) * perPage + index + 1,
        className: "w-16 text-center text-gray-500",
    },
    {
        header: "Jenis Unsur",
        cell: (row) => row.element?.name || "-",
    },
    {
        header: "Nama Rupabumi",
        accessorKey: "map_name",
        className: "",
    },
    {
        header: "Kabupaten/ Kota",
        cell: (row) => row.regency?.name || "-",
    },
    {
        header: "Provinsi",
        cell: (row) => row.province?.name || "-",
    },
    {
        header: "Aksi",
        cell: () => (
            <div className="flex items-center justify-center gap-2">
                <button className="p-2 text-navy-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Lihat Detail">
                    <Search size={16} strokeWidth={2.5} />
                </button>
            </div>
        ),
        className: "text-center",
    },
];

const PengumumanPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    // Fetch data using the hook
    const { data: response, isLoading } = usePublicToponyms({
        page: page.toString(),
        limit: "10",
        search: search, // Assuming search is supported by API
    });

    return (
        <PublicLayout>
            <div className="h-full bg-gray-50/30 pt-12 pb-24 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-navy-900 mb-2">Nama Rupabumi</h1>
                        <p className="text-gray-500 text-sm">Daftar nama rupabumi yang terdata dalam sistem informasi.</p>
                    </div>

                    {/* Table Container */}
                    <DataTable<PublicToponym>
                        columns={generateColumns(page, 10)}
                        data={response?.data || []}
                        isLoading={isLoading}
                        pagination={response?.pagination}
                        onPageChange={(newPage) => setPage(newPage)}
                        showDownload={true}
                        onSearch={(v) => {
                            setSearch(v);
                            setPage(1); // reset page on search
                        }}
                    />
                </div>
            </div>
        </PublicLayout>
    )
}

export default PengumumanPage