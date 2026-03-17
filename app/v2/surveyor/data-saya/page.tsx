"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SurveyorLayout from '@/components/v2/nav/SurveyorLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, SlidersHorizontal, Map as MapIcon, Edit, Trash2 } from 'lucide-react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { useApiHandlerWithPagination, PaginationInfo } from '@/utils/apiHandler';
import { useRouter } from 'next/navigation';

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
    const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
        "data survei": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
        "penelaahan kabupaten/kota": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
        "penelaahan provinsi": { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
        "penelaahan pusat": { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
        "penetapan": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
        "baku": { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
        "pengajuan": { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
    };

    const style = statusStyles[s] || { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" };

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border border-current/10`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
            <span className="capitalize">{s}</span>
        </div>
    );
};

const MyDataPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ToponymData[]>([]);
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | undefined>(undefined);

    const apiHandler = useApiHandlerWithPagination<any>({ setLoading, shouldHandleError: true });

    const fetchData = useCallback(async () => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            per_page: limit.toString(),
            ...(search ? { search } : {})
        });

        const result = await apiHandler("GET", `/survey/toponyms?${queryParams.toString()}`);
        
        if (result?.data && Array.isArray(result.data)) {
            const mappedData = result.data.map((item: any, index: number) => ({
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
            }));
            setData(mappedData);
            if (result.pagination) {
                setPagination(result.pagination);
            }
        }
    }, [apiHandler, page, limit, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: ColumnDef<ToponymData>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal", accessorKey: "survey_at", className: "w-32" },
        { header: "Jenis Unsur", accessorKey: "element_type" },
        { header: "Nama Lokal", accessorKey: "specific_element" },
        { header: "Wilayah", cell: (row) => `${row.regency}, ${row.province}`, className: "max-w-[200px] truncate" },
        { header: "Status", cell: (row) => getStatusBadgeV2(row.status) },
        { 
            header: "Aksi", 
            className: "w-24 text-center",
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <button 
                        onClick={() => router.push(`/v2/surveyor/data-saya/edit?id=${row.id}`)}
                        className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Data"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Hapus Data"
                    >
                        <Trash2 size={16} />
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
                    <p className="text-gray-500 text-sm">Kelola data toponim yang telah anda kumpulkan.</p>
                </div>
                <ButtonComponent
                    label="Tambah Data"
                    onClick={() => router.push('/v2/surveyor/data-saya/tambah')}
                    icon={<Plus size={16} />}
                />
            </div>

            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={loading}
                    showSearch={true}
                    showFilter={true}
                    showMap={true}
                    onSearch={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                    onFilter={() => {}}
                    onMap={() => router.push('/v2/surveyor/data-saya/peta')}
                    pagination={pagination}
                    onPageChange={(p) => setPage(p)}
                />
            </div>
        </SurveyorLayout>
    );
};

export default MyDataPage;
