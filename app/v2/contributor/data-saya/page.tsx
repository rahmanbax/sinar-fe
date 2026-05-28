"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import FilterModal, { FilterState } from '@/components/v2/modals/FilterModal';
import { Plus, Search } from 'lucide-react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { useRouter } from 'next/navigation';
import { getToponyms } from '@/api/toponym';
import { useAuth } from '@/contexts/AuthContext';
import MapModal from '@/components/v2/modals/MapModal';
import { useElements } from '@/hooks/useRegions';
import { useSurveyBoundingBox } from '@/hooks/useToponyms';
import Link from 'next/link';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

const getStatusNameFromLevel = (level: number | undefined): string => {
    switch (level) {
        case -1: return "Ditolak";
        case 0: return "Pengajuan Kota/Kab";
        case 1: return "Penelaahan Kota/Kab";
        case 2: return "Rekomendasi Provinsi";
        case 3: return "Pengajuan Provinsi";
        case 4: return "Penelaahan Provinsi";
        case 5: return "Rekomendasi Pusat";
        case 6: return "Pengajuan Pusat";
        case 7: return "Penelaahan Pusat";
        case 8: return "Penetapan";
        case 9: return "Baku";
        default: return "Pengajuan";
    }
};

const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    const statusStyles: Record<string, { bg: string; text: string }> = {
        "baku": { bg: "bg-emerald-100", text: "text-emerald-700" },
        "pengajuan kota/kab": { bg: "bg-amber-100", text: "text-amber-700" },
        "pengajuan provinsi": { bg: "bg-amber-100", text: "text-amber-700" },
        "pengajuan pusat": { bg: "bg-amber-100", text: "text-amber-700" },
        "ditolak": { bg: "bg-rose-100", text: "text-rose-700" },
        "penelaahan kota/kab": { bg: "bg-slate-100", text: "text-slate-700" },
        "penelaahan provinsi": { bg: "bg-slate-100", text: "text-slate-700" },
        "penelaahan pusat": { bg: "bg-slate-100", text: "text-slate-700" },
        "rekomendasi provinsi": { bg: "bg-blue-100", text: "text-blue-700" },
        "rekomendasi pusat": { bg: "bg-blue-100", text: "text-blue-700" },
        "penetapan": { bg: "bg-emerald-100", text: "text-emerald-700" },
        "pengajuan": { bg: "bg-amber-100", text: "text-amber-700" },
    };
    const style = statusStyles[s] || { bg: "bg-gray-100", text: "text-gray-700" };
    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} whitespace-nowrap`}>
            <span className="capitalize">{s}</span>
        </div>
    );
};

const ContributorDataSayaPage = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [limit] = useState(10);
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState | undefined>();

    const { token } = useAuth();

    const { data: boundingBoxRes } = useSurveyBoundingBox(token);
    const mapMarkers = useMemo(() => {
        if (!boundingBoxRes?.data?.results) return [];
        return boundingBoxRes.data.results.map((item: any) => ({
            longitude: item.lng,
            latitude: item.lat,
            color: item.status === 'baku' ? '#053378' : '#DEB43F',
            label: item.map_name || item.local_name,
        }));
    }, [boundingBoxRes]);

    const { data: elementsData } = useElements(token);
    const elements = useMemo(() =>
        (elementsData?.data ?? []).map((e: any) => ({
            label: e.name || e.nama || "Tanpa Nama",
            value: (e.code || e.id || e.value || "").toString(),
        })),
        [elementsData]
    );

    const { data: queryResult, isLoading: loading, refetch } = useQuery({
        queryKey: ['contributor-toponyms', page, limit, search, filters, token],
        queryFn: async () => {
            const queryParams: Record<string, string> = {
                page: page.toString(),
                per_page: limit.toString(),
                ...(search ? { search } : {}),
                ...(filters?.jenisUnsur ? { element_id: filters.jenisUnsur } : {}),
                ...(filters?.status ? { status_level: filters.status } : {}),
            };
            return await getToponyms(token, queryParams);
        },
    });

    useEffect(() => {
        if (token) refetch();
    }, [token, refetch]);

    const data = queryResult?.data && Array.isArray(queryResult.data)
        ? queryResult.data.map((item: any, index: number) => ({
            id: item.id,
            no: (page - 1) * limit + (index + 1),
            created_at: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
            survey_at: item.survey_at ? new Date(item.survey_at).toLocaleDateString("id-ID") : "-",
            element_type: item.element?.name ?? "-",
            map_name: item.map_name || "-",
            province: item.province?.name ?? "-",
            regency: item.regency?.name ?? "-",
            status: getStatusNameFromLevel(item.status_level),
        }))
        : [];

    const pagination = queryResult?.pagination;

    const columns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal Dibuat", accessorKey: "created_at", className: "w-32 text-center" },
        { header: "Tanggal Survey", accessorKey: "survey_at", className: "w-32 text-center" },
        { header: "Jenis Unsur", accessorKey: "element_type" },
        { header: "Nama Rupabumi", accessorKey: "map_name" },
        { header: "Kabupaten/Kota", accessorKey: "regency", className: "whitespace-nowrap text-center" },
        { header: "Provinsi", accessorKey: "province", className: "whitespace-nowrap text-center" },
        { header: "Status", cell: (row) => getStatusBadge(row.status), className: "text-center" },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => (
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => router.push(`/v2/contributor/data-saya/${row.id}`)}
                        className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Lihat Detail"
                    >
                        <Search size={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">Data Saya</h1>
                <Link href="/v2/contributor/data-saya/tambah">
                    <ButtonComponent label="Tambah Data" icon={<Plus size={16} />} />
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                showSearch={true}
                showFilter={true}
                showMap={true}
                onSearch={(val) => { setSearch(val); setPage(1); }}
                onFilter={() => setIsFilterOpen(true)}
                onMap={() => setIsMapOpen(true)}
                pagination={pagination}
                onPageChange={(p) => setPage(p)}
            />

            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                initialFilters={filters}
                onApply={(newFilters) => { setFilters(newFilters); setPage(1); setIsFilterOpen(false); }}
                fields={[
                    {
                        id: 'jenisUnsur',
                        label: 'Jenis Unsur',
                        searchable: true,
                        options: elements,
                        placeholder: 'Jenis Unsur',
                    },
                    {
                        id: 'status',
                        label: 'Status',
                        options: [
                            { value: '9', label: 'Baku' },
                            { value: '8', label: 'Penetapan' },
                            { value: '6', label: 'Pengajuan Pusat' },
                            { value: '3', label: 'Pengajuan Provinsi' },
                            { value: '0', label: 'Pengajuan Kab/Kota' },
                            { value: '-1', label: 'Ditolak' },
                        ],
                    },
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

export default ContributorDataSayaPage;
