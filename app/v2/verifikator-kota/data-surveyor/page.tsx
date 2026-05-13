"use client";

import React, { useState, useMemo } from 'react';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import FilterModal, { FilterState } from '@/components/v2/modals/FilterModal';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MapModal from '@/components/v2/modals/MapModal';
import { useProvinces, useCities, useElements } from '@/hooks/useRegions';
import { useVerificationsToponyms } from '@/hooks/useVerification';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
 
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

const DataSurveyorPage = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState | undefined>();
    const [activeProvinceForFilter, setActiveProvinceForFilter] = useState<string>("");

    const { token } = useAuth();

    // --- TanStack Query hooks for filter options ---
    const { data: provincesData } = useProvinces(token);
    const { data: elementsData } = useElements(token);

    const { data: toponymsResponse, isLoading } = useVerificationsToponyms(token, {
        page,
        per_page: 10,
        search,
        element_id: filters?.jenisUnsur,
        province_id: filters?.provinsi,
        regency_id: filters?.kabupaten,
        status: filters?.status,
    });

    const toponyms = useMemo(() => {
        return (toponymsResponse?.data ?? []).map((item: any, index: number) => ({
            ...item,
            no: (page - 1) * 10 + index + 1,
            created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : "-",
            survey_at: item.survey_at ? new Date(item.survey_at).toLocaleDateString('id-ID') : "-",
            element_type: item.element?.name || "-",
            regency: item.regency?.name || "-",
            province: item.province?.name || "-",
        }));
    }, [toponymsResponse, page]);

    const mapMarkers = useMemo(() => {
        return (toponymsResponse?.data ?? [])
            .filter((item: any) => item.location_point?.coordinates)
            .map((item: any) => ({
                longitude: item.location_point.coordinates[0],
                latitude: item.location_point.coordinates[1],
                color: item.status === 'baku' ? '#10b981' : '#f59e0b',
                label: item.map_name || item.local_name || "Tanpa Nama"
            }));
    }, [toponymsResponse]);

    const provinces = useMemo(() =>
        (provincesData?.data ?? []).map((p) => ({
            label: p.name,
            value: p.code,
            path: p.path,
        })),
        [provincesData]
    );

    const elements = useMemo(() =>
        (elementsData?.data ?? []).map((e: any) => ({
            label: e.name || e.nama || "Tanpa Nama",
            value: (e.code || e.id || e.value || "").toString(),
        })),
        [elementsData]
    );

    const selectedProvinceId = activeProvinceForFilter || filters?.provinsi || null;
    const selectedProvincePath = useMemo(() => {
        if (!selectedProvinceId) return null;
        return provinces.find((p) => p.value === selectedProvinceId)?.path ?? null;
    }, [selectedProvinceId, provinces]);

    const { data: citiesData } = useCities(selectedProvincePath, token);

    const cities = useMemo(() =>
        (citiesData?.data ?? []).map((c) => ({
            label: c.name,
            value: c.code,
        })),
        [citiesData]
    );

    const columns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal Dibuat", accessorKey: "created_at", className: "w-32" },
        { header: "Tanggal Survey", accessorKey: "survey_at", className: "w-32" },
        { header: "Jenis Unsur", accessorKey: "element_type" },
        { header: "Nama Rupabumi", accessorKey: "map_name" },
        { header: "Kabupaten/ Kota", accessorKey: "regency", className: "uppercase whitespace-nowrap" },
        { header: "Provinsi", accessorKey: "province", className: "uppercase whitespace-nowrap" },
        { header: "Status", cell: (row) => getStatusBadgeV2(row.status) },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => (
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => {}} // Dummy action
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
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Data Surveyor</h1>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={toponyms}
                isLoading={isLoading}
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
                onMap={() => setIsMapOpen(true)}
                pagination={toponymsResponse?.pagination || {
                    total: 0,
                    per_page: 10,
                    current_page: 1,
                    last_page: 1,
                    from: 0,
                    to: 0
                }}
                onPageChange={(p) => setPage(p)}
            />

            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => {
                    setIsFilterOpen(false);
                    setActiveProvinceForFilter("");
                }}
                initialFilters={filters}
                onFieldChange={(id, value) => {
                    if (id === 'provinsi') setActiveProvinceForFilter(value);
                }}
                onApply={(newFilters) => {
                    setFilters(newFilters);
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
                        placeholder: !selectedProvinceId ? "Kabupaten/Kota" : "Kabupaten/ Kota"
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

            <MapModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                markers={mapMarkers}
            />
        </DashboardLayout>
    );
};

export default DataSurveyorPage;
