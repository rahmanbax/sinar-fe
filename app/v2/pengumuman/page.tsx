"use client";

import PublicLayout from '@/components/v2/nav/PublicLayout'
import React, { Suspense } from 'react'
import { usePublicToponyms, PublicToponym } from '@/hooks/useToponyms'
import { Eye, Download, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FilterModal, { type FilterState } from "@/components/v2/modals/FilterModal";
import { useProvinces, useCities, useElements } from "@/hooks/useRegions";

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
                    <Search size={16} strokeWidth={2} />
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

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>({
        element_id: searchParams.get('element_id') || undefined,
        province_id: searchParams.get('province_id') || undefined,
        regency_id: searchParams.get('regency_id') || undefined,
    });
    const [activeProvinceForFilter, setActiveProvinceForFilter] = useState<string>("");

    const { data: elementsData } = useElements("public");
    const { data: provincesData } = useProvinces();

    const provinces = useMemo(() =>
        (provincesData?.data ?? []).map((p: any) => ({
            label: p.name,
            value: p.code,
            path: p.path,
        })),
        [provincesData]
    );

    const selectedProvinceId = activeProvinceForFilter || filterState.province_id || null;
    const selectedProvincePath = useMemo(() => {
        if (!selectedProvinceId) return null;
        return provinces.find((p) => p.value === selectedProvinceId)?.path ?? null;
    }, [selectedProvinceId, provinces]);

    const { data: citiesData } = useCities(selectedProvincePath, "public");

    const cities = useMemo(() =>
        (citiesData?.data ?? []).map((c: any) => ({
            label: c.name,
            value: c.code,
        })),
        [citiesData]
    );

    const filterFields = useMemo(() => [
        {
            id: "element_id",
            label: "Jenis Unsur",
            options: elementsData?.data?.map((e: any) => ({ 
                label: e.name || e.nama || "Tanpa Nama", 
                value: (e.code || e.id || e.value || "").toString() 
            })) || [],
            searchable: true,
            placeholder: "Jenis Unsur",
        },
        {
            id: "province_id",
            label: "Provinsi",
            options: provinces,
            searchable: true,
            placeholder: "Provinsi",
        },
        {
            id: "regency_id",
            label: "Kabupaten/Kota",
            options: cities,
            searchable: true,
            placeholder: !selectedProvinceId ? "Kabupaten/Kota" : "Kabupaten/ Kota",
        }
    ], [elementsData, provinces, cities, selectedProvinceId]);

    const updateParams = (newPage: number, newSearch: string, newFilters?: FilterState) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (newPage > 1) params.set('page', newPage.toString());
        else params.delete('page');

        if (newSearch) params.set('search', newSearch);
        else params.delete('search');

        if (newFilters) {
            if (newFilters.element_id) params.set('element_id', newFilters.element_id);
            else params.delete('element_id');
            if (newFilters.province_id) params.set('province_id', newFilters.province_id);
            else params.delete('province_id');
            if (newFilters.regency_id) params.set('regency_id', newFilters.regency_id);
            else params.delete('regency_id');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    // Fetch data using the hook
    const { data: response, isLoading } = usePublicToponyms({
        page: page.toString(),
        limit: "10",
        ...(search ? { search } : {}),
        ...(filterState.element_id ? { element_id: filterState.element_id } : {}),
        ...(filterState.province_id ? { province_id: filterState.province_id } : {}),
        ...(filterState.regency_id ? { regency_id: filterState.regency_id } : {}),
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
                    initialSearch={search}
                    onSearch={(v) => {
                        if (v !== search) {
                            updateParams(1, v, filterState);
                        }
                    }}
                    onFilter={() => setIsFilterModalOpen(true)}
                />
            </div>
            
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => {
                    setIsFilterModalOpen(false);
                    setActiveProvinceForFilter("");
                }}
                fields={filterFields}
                initialFilters={filterState}
                onFieldChange={(id, value) => {
                    if (id === 'province_id') {
                        setActiveProvinceForFilter(value);
                    }
                }}
                onApply={(filters) => {
                    setFilterState(filters);
                    setIsFilterModalOpen(false);
                    updateParams(1, search, filters);
                }}
            />
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