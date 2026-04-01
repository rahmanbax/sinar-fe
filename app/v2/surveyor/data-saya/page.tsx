"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SurveyorLayout from '@/components/v2/nav/SurveyorLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import FilterModal, { FilterState } from '@/components/v2/modals/FilterModal';
import { Plus, SlidersHorizontal, Map as MapIcon, Search, Eye, FileText, Download } from 'lucide-react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { useRouter } from 'next/navigation';
import { getToponyms } from '@/api/toponym';
import { getRegions } from '@/api/region';
import { getElements } from '@/api/classification';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ToponymData {
    id: number | string;
    no: number;
    created_at: string;
    survey_at: string;
    element_type: string;
    generic_element: string;
    specific_element: string;
    province: string;
    regency: string;
    source: string;
    status: string;
}

const getStatusBadgeV2 = (status: string) => {
    const s = status?.toLowerCase() || "";
    const statusStyles: Record<string, { bg: string; text: string }> = {
        "baku": { bg: "bg-emerald-100", text: "text-emerald-700" },
        "pengajuan": { bg: "bg-amber-100", text: "text-amber-700" },
        "ditolak": { bg: "bg-rose-100", text: "text-rose-700" },
        "penelaahan": { bg: "bg-slate-100", text: "text-slate-700" },
        "penelaahan kabupaten/kota": { bg: "bg-slate-100", text: "text-slate-700" },
        "penelaahan provinsi": { bg: "bg-slate-100", text: "text-slate-700" },
        "penelaahan pusat": { bg: "bg-slate-100", text: "text-slate-700" },
        "penerapan": { bg: "bg-emerald-100", text: "text-emerald-700" },
        "data survei": { bg: "bg-blue-100", text: "text-blue-700" },
    };

    const style = statusStyles[s] || { bg: "bg-gray-100", text: "text-gray-700" };

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} whitespace-nowrap`}>
            <span className="capitalize">{s}</span>
        </div>
    );
};

const MyDataPage = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState | undefined>();
    const [activeProvinceForFilter, setActiveProvinceForFilter] = useState<string | "">("");

    // Options for filters
    const [provinces, setProvinces] = useState<{label: string, value: string}[]>([]);
    const [cities, setCities] = useState<{label: string, value: string}[]>([]);
    const [elements, setElements] = useState<{label: string, value: string}[]>([]);

    const { token } = useAuth();

    // Fetch initial filter options
    useEffect(() => {
        if (!token) return;
        
        // Fetch Provinces
        getRegions({ level: 'PROVINCE', token }).then(res => {
            const provinceData = res?.data?.results || res?.results || res?.data || (Array.isArray(res) ? res : []);
            if (Array.isArray(provinceData)) {
                setProvinces(provinceData.map((p: any, index: number) => ({ 
                    label: p.name || p.nama || p.label || "Tanpa Nama", 
                    value: (p.id?.toString() || p.code?.toString() || p.value?.toString() || `prov-${index}`),
                    path: p.path 
                })));
            }
        });

        // Fetch Elements
        getElements(token).then(res => {
            const elementsData = res?.data?.results || res?.data || (Array.isArray(res) ? res : []);
            if (Array.isArray(elementsData)) {
                setElements(elementsData.map((e: any, index: number) => ({ 
                    label: e.name || e.nama || e.label || "Tanpa Nama", 
                    value: (e.code || e.id || e.value || `ele-${index}`).toString() 
                })));
            }
        });
    }, [token]);

    useEffect(() => {
        const provinceId = activeProvinceForFilter || filters?.provinsi;
        
        if (!token || !provinceId) {
            setCities([]);
            return;
        }

        // Find the path for this province ID to get cities
        const selectedProv = provinces.find(p => p.value === provinceId);
        const parentPath = (selectedProv as any)?.path || provinceId;

        getRegions({ level: 'CITY', parent: parentPath, token }).then(res => {
            const cityData = res?.data?.results || res?.results || res?.data || (Array.isArray(res) ? res : []);
            if (Array.isArray(cityData)) {
                setCities(cityData.map((c: any, index: number) => ({ 
                    label: c.name || c.nama || c.label || "Tanpa Nama", 
                    value: (c.id?.toString() || c.code?.toString() || c.value?.toString() || `city-${index}`)
                })));
            }
        });
    }, [token, filters?.provinsi, activeProvinceForFilter, provinces]);

    const { data: queryResult, isLoading: loading } = useQuery({
        queryKey: ['survey-toponyms', page, limit, search, filters, token],
        queryFn: async () => {
            const queryParams: Record<string, string> = {
                page: page.toString(),
                per_page: limit.toString(),
                ...(search ? { search } : {}),
                ...(filters?.provinsi ? { province_id: filters.provinsi } : {}),
                ...(filters?.kabupaten ? { regency_id: filters.kabupaten } : {}),
                ...(filters?.jenisUnsur ? { element_id: filters.jenisUnsur } : {}),
                ...(filters?.status ? { status: filters.status } : {}),
            };

            // TODO: Append actual filters to queryParams here if needed

            return await getToponyms(token, queryParams);
        }
    });

    const data = queryResult?.data && Array.isArray(queryResult.data)
        ? queryResult.data.map((item: any, index: number) => ({
            id: item.id,
            no: (page - 1) * limit + (index + 1),
            created_at: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
            survey_at: item.survey_at ? new Date(item.survey_at).toLocaleDateString("id-ID") : "-",
            element_type: item.element?.name ?? "-",
            generic_element: item.generic_element || "-",
            specific_element: item.specific_element || "-",
            province: item.province?.name ?? "-",
            regency: item.regency?.name ?? "-",
            source: item.source || "-",
            status: item.status || "pengajuan",
        }))
        : [];

    const pagination = queryResult?.pagination;

    const columns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal Dibuat", accessorKey: "created_at", className: "w-32" },
        { header: "Tanggal Survey", accessorKey: "survey_at", className: "w-32" },
        { header: "Jenis Unsur", accessorKey: "element_type" },
        { header: "Nama Rupabumi", accessorKey: "specific_element" },
        { header: "Kabupaten/ Kota", accessorKey: "regency", className: "uppercase whitespace-nowrap" },
        { header: "Provinsi", accessorKey: "province", className: "uppercase whitespace-nowrap" },
        { header: "Status", cell: (row) => getStatusBadgeV2(row.status) },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => (
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => router.push(`/v2/surveyor/data-saya/detail?id=${row.id}`)}
                        className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Lihat Detail"
                    >
                        <Search size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <SurveyorLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 mb-1">Data Saya</h1>
                </div>
                <ButtonComponent
                    label="Tambah Data"
                    onClick={() => router.push('/v2/surveyor/data-saya/tambah')}
                    icon={<Plus size={16} />}
                />
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                showSearch={true}
                showFilter={true}
                showDownload={true}
                showMap={true}
                onSearch={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                onFilter={() => setIsFilterOpen(true)}
                onDownload={() => alert("Fitur unduh segera hadir!")}
                onMap={() => router.push('/v2/surveyor/data-saya/peta')}
                pagination={pagination}
                onPageChange={(p) => setPage(p)}
            />

            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => {
                    setIsFilterOpen(false);
                    setActiveProvinceForFilter(""); // clear draft state on close
                }}
                initialFilters={filters}
                onChange={(newFilters) => {
                    if (newFilters.provinsi !== activeProvinceForFilter) {
                        setActiveProvinceForFilter(newFilters.provinsi || "");
                    }
                }}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setPage(1); 
                    setIsFilterOpen(false);
                }}
                fields={[
                    {
                        id: 'jenisUnsur',
                        label: 'Jenis Unsur',
                        searchable: true,
                        options: elements,
                        placeholder: 'Jenis Unsur'
                    },
                    {
                        id: 'provinsi',
                        label: 'Provinsi',
                        searchable: true,
                        options: provinces,
                        placeholder: 'Provinsi'
                    },
                    {
                        id: 'kabupaten',
                        label: 'Kabupaten/ Kota',
                        searchable: true,
                        options: cities,
                        placeholder: !(activeProvinceForFilter || filters?.provinsi) ? "Kabupaten/ Kota" : "Kabupaten/ Kota"
                    },
                    {
                        id: 'status',
                        label: 'Status',
                        options: [
                            { value: 'baku', label: 'Baku' },
                            { value: 'pengajuan', label: 'Pengajuan' },
                            { value: 'data survei', label: 'Data Survei' },
                            { value: 'penelaahan kabupaten/kota', label: 'Penelaahan Kab/Kota' },
                            { value: 'penelaahan provinsi', label: 'Penelaahan Provinsi' },
                            { value: 'penelaahan pusat', label: 'Penelaahan Pusat' },
                            { value: 'penetapan', label: 'Penetapan' },
                        ]
                    }
                ]}
            />
        </SurveyorLayout>
    );
};

export default MyDataPage;
