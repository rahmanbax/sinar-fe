"use client";

import PublicLayout from '@/components/v2/nav/PublicLayout'
import React, { Suspense } from 'react'
import { usePublicToponyms, PublicToponym } from '@/hooks/useToponyms'
import { Eye, Download, Search } from 'lucide-react'
import { useState } from 'react'
import dayjs from 'dayjs'
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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
        cell: (row) => (
            <div className="flex items-center justify-center gap-2">
                <Link href={`/v2?id=${row.id}`} className="p-2 block hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Lihat Peta">
                    <Search size={16} strokeWidth={2.5} />
                </Link>
            </div>
        ),
        className: "text-center",
    },
];

const PengumumanContent = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || "";

    const updateParams = (newPage: number, newSearch: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (newPage > 1) params.set('page', newPage.toString());
        else params.delete('page');

        if (newSearch) params.set('search', newSearch);
        else params.delete('search');

        router.push(`${pathname}?${params.toString()}`);
    };

    // Fetch data using the hook
    const { data: response, isLoading } = usePublicToponyms({
        page: page.toString(),
        limit: "10",
        search: search, // Assuming search is supported by API
    });

    return (
        <div className="h-full py-12 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Pengumuman Nama Rupabumi</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">Pantau perkembangan terkini proses pengumpulan, penelaahan, hingga persetujuan dan pembakuan nama rupabumi di seluruh wilayah Indonesia.</p>
                </div>

                {/* Table Container */}
                <DataTable<PublicToponym>
                    columns={generateColumns(page, 10)}
                    data={response?.data || []}
                    isLoading={isLoading}
                    pagination={response?.pagination}
                    onPageChange={(newPage) => updateParams(newPage, search)}
                    showDownload={true}
                    initialSearch={search}
                    onSearch={(v) => {
                        if (v !== search) {
                            updateParams(1, v);
                        }
                    }}
                />
            </div>
        </div>
    )
}

const PengumumanPage = () => {
    return (
        <PublicLayout>
            <Suspense fallback={
                <div className="h-full flex items-center justify-center py-40">
                    <span className="text-gray-500 font-semibold animate-pulse text-sm">Memuat Pengumuman...</span>
                </div>
            }>
                <PengumumanContent />
            </Suspense>
        </PublicLayout>
    )
}

export default PengumumanPage