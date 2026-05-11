"use client";

import React, { useState, useMemo } from 'react';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import FilterModal, { FilterState } from '@/components/v2/modals/FilterModal';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MapModal from '@/components/v2/modals/MapModal';
import { useProvinces, useCities, useElements } from '@/hooks/useRegions';
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

    // --- Dummy Data for Table ---
    const dummyData = useMemo(() => [
        { id: 1, no: 1, created_at: "08/05/2026", survey_at: "07/05/2026", element_type: "Gunung", map_name: "Gunung Gede", province: "JAWA BARAT", regency: "KABUPATEN CIANJUR", status: "pengajuan" },
        { id: 2, no: 2, created_at: "08/05/2026", survey_at: "06/05/2026", element_type: "Bukit", map_name: "Bukit Moko", province: "JAWA BARAT", regency: "KABUPATEN BANDUNG", status: "data survei" },
        { id: 3, no: 3, created_at: "07/05/2026", survey_at: "05/05/2026", element_type: "Stadion", map_name: "Gelora Bandung Lautan Api", province: "JAWA BARAT", regency: "KOTA BANDUNG", status: "baku" },
        { id: 4, no: 4, created_at: "06/05/2026", survey_at: "04/05/2026", element_type: "Candi", map_name: "Candi Prambanan", province: "DI YOGYAKARTA", regency: "KABUPATEN SLEMAN", status: "baku" },
        { id: 5, no: 5, created_at: "05/05/2026", survey_at: "03/05/2026", element_type: "Laut", map_name: "Laut Jawa", province: "JAWA BARAT", regency: "KOTA CIREBON", status: "penelaahan kabupaten/kota" },
    ], []);

    const mapMarkers = useMemo(() => [
        { longitude: 107.037, latitude: -6.743, color: '#DEB43F', label: "Gunung Gede" },
        { longitude: 107.683, latitude: -6.848, color: '#DEB43F', label: "Bukit Moko" },
        { longitude: 107.751, latitude: -6.957, color: '#053378', label: "Gelora Bandung Lautan Api" },
        { longitude: 110.491, latitude: -7.752, color: '#053378', label: "Candi Prambanan" },
        { longitude: 108.572, latitude: -6.706, color: '#64748b', label: "Laut Jawa" },
    ], []);

    // --- TanStack Query hooks for filter options ---
    const { data: provincesData } = useProvinces(token);
    const { data: elementsData } = useElements(token);

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
                data={dummyData}
                isLoading={false}
                showSearch={true}
                showFilter={true}
                showDownload={true}
                showMap={true}
                onSearch={(val) => {
                    setSearch(val);
                }}
                onFilter={() => setIsFilterOpen(true)}
                onDownload={() => alert("Fitur unduh segera hadir!")}
                onMap={() => setIsMapOpen(true)}
                pagination={{
                    total: 5,
                    per_page: 10,
                    current_page: 1,
                    last_page: 1,
                    from: 1,
                    to: 5
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
