"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { ChevronLeft, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getVerificationTransactions,
    getVerificationTransactionToponyms,
    VerificationTransaction
} from '@/api/verification';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { useProvinces, useCities } from '@/hooks/useRegions';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

const TransactionDetailContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const transactionId = searchParams.get('transactionId');
    const { token } = useAuth();

    // States
    const [transaction, setTransaction] = useState<VerificationTransaction | null>(null);
    const [allToponyms, setAllToponyms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingToponyms, setLoadingToponyms] = useState(false);

    // Search state
    const [searchText, setSearchText] = useState("");

    const { data: provincesRes } = useProvinces(token);

    // Determine the province path for city lookup.
    // We take it from the first toponym in the list.
    const firstProvinceId = useMemo(() => {
        if (allToponyms.length === 0) return null;
        const first = allToponyms[0];
        return first.province_id || first.toponym?.province_id || null;
    }, [allToponyms]);

    const firstProvincePath = useMemo(() => {
        if (!provincesRes?.data || !firstProvinceId) return null;
        return provincesRes.data.find(p => p.code === firstProvinceId)?.path || null;
    }, [provincesRes, firstProvinceId]);

    const { data: citiesRes } = useCities(firstProvincePath, token);

    const getProvinceName = (id: string) => {
        return provincesRes?.data?.find(p => p.code === id)?.name || id || "-";
    };

    const getRegencyName = (id: string) => {
        return citiesRes?.data?.find(c => c.code === id)?.name || id || "-";
    };

    const fetchTransactionHeader = useCallback(async () => {
        if (!token || !transactionId) return;
        setLoading(true);
        try {
            const res = await getVerificationTransactions(token);
            if (!res.error) {
                const found = res.data?.find((t: VerificationTransaction) => t.id === transactionId);
                if (found) setTransaction(found);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token, transactionId]);

    const fetchToponyms = useCallback(async () => {
        if (!token || !transactionId) return;
        setLoadingToponyms(true);
        try {
            const res = await getVerificationTransactionToponyms(token, transactionId, {
                page: 1,
                per_page: 9999
            });
            if (!res.error) {
                const transformed = res.data?.map((item: any, idx: number) => ({
                    id: item.id,
                    no: idx + 1,
                    date: item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY") : "-",
                    element: item.element?.name || item.element_name || item.toponym?.element?.name || item.toponym?.element_name || "-",
                    name: item.map_name || item.local_name || item.name || item.toponym?.map_name || item.toponym?.local_name || item.toponym?.name || "-",
                    province_id: item.province_id || item.toponym?.province_id,
                    regency_id: item.regency_id || item.toponym?.regency_id,
                    province_name: item.province_name || item.province?.name || item.toponym?.province_name || item.toponym?.province?.name || "-",
                    regency_name: item.regency_name || item.regency?.name || item.city_name || item.city?.name || item.toponym?.regency_name || item.toponym?.regency?.name || item.toponym?.city_name || item.toponym?.city?.name || "-",
                    surveyor: item.surveyor_name || item.creator?.name || item.toponym?.surveyor_name || item.toponym?.creator?.name || "-",
                    assignedTo: item.review_transaction_data?.[0]?.user?.name || item.review_transaction_data?.[0]?.user || "-",
                    coordinates: item.location_point ?
                        `${item.location_point.coordinates[0].toFixed(3)}, ${item.location_point.coordinates[1].toFixed(3)}` :
                        item.toponym?.location_point ?
                            `${item.toponym.location_point.coordinates[0].toFixed(3)}, ${item.toponym.location_point.coordinates[1].toFixed(3)}` :
                            "-",
                }));
                setAllToponyms(transformed || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingToponyms(false);
        }
    }, [token, transactionId]);

    useEffect(() => {
        fetchTransactionHeader();
        fetchToponyms();
    }, [fetchTransactionHeader, fetchToponyms]);

    // Local Search Filtering & Name Mapping
    const filteredToponyms = useMemo(() => {
        const mapped = allToponyms.map(t => ({
            ...t,
            province_display: t.province_name && t.province_name !== "-" && isNaN(Number(t.province_name))
                ? t.province_name
                : getProvinceName(t.province_id || t.toponym?.province_id),
            regency_display: t.regency_name && t.regency_name !== "-" && isNaN(Number(t.regency_name))
                ? t.regency_name
                : getRegencyName(t.regency_id || t.toponym?.regency_id),
        }));

        if (!searchText) return mapped;
        const s = searchText.toLowerCase();
        return mapped.filter(t =>
            t.name.toLowerCase().includes(s) ||
            t.element.toLowerCase().includes(s) ||
            t.surveyor.toLowerCase().includes(s)
        );
    }, [allToponyms, searchText, provincesRes, citiesRes]);

    const columns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal Diajukan", accessorKey: "date", className: "w-32" },
        { header: "Jenis Unsur", accessorKey: "element" },
        { header: "Nama Rupabumi", accessorKey: "name", className: "font-medium" },
        { header: "Provinsi", accessorKey: "province_display" },
        { header: "Kabupaten/ Kota", accessorKey: "regency_display" },
        { header: "Surveyor", accessorKey: "surveyor" },
        { header: "Ditugaskan ke", accessorKey: "assignedTo" },
        { header: "Koordinat", accessorKey: "coordinates" },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => router.push(`/v2/verifikator-provinsi/data-penelaahan/detail/${row.id}?transactionId=${transactionId}`)}
                        className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <Search size={18} />
                    </button>
                </div>
            )
        }
    ];

    if (loading && !transaction) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 animate-pulse font-medium">Memuat detail penelaahan...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg  transition-colors"><ChevronLeft size={24} /></button>
                <h1 className="text-xl font-bold ">{transaction?.title || 'Detail Penelaahan'}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                    <span className="text-2xl font-bold ">{transaction?.element_count || 0}</span>
                    <span className="text-sm font-medium text-gray-500">Jenis Unsur</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                    <span className="text-2xl font-bold ">{transaction?.district_count || 0}</span>
                    <span className="text-sm font-medium text-gray-500">Kecamatan</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                    <span className="text-2xl font-bold ">{transaction?.total_data || 0}</span>
                    <span className="text-sm font-medium text-gray-500">Total Data</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                    <span className="text-2xl font-bold ">{transaction?.handled_data || 0}</span>
                    <span className="text-sm font-medium text-gray-500">Data Sudah Ditelaah</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                    <span className="text-2xl font-bold ">{transaction?.verificator_count || 0}</span>
                    <span className="text-sm font-medium text-gray-500">Verifikator</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[500px] overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredToponyms}
                    isLoading={loadingToponyms}
                    showSearch={true}
                    showFilter={true}
                    initialSearch={searchText}
                    onSearch={(v) => setSearchText(v)}
                />
            </div>
        </div>
    );
};

const TransactionDetailPage = () => {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Menyesuaikan data penelaahan...</p>
                </div>
            }>
                <TransactionDetailContent />
            </Suspense>
        </DashboardLayout>
    );
};

export default TransactionDetailPage;
