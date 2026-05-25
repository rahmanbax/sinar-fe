"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search } from 'lucide-react';
import DataPenelaahanLayout from '@/components/v2/layout/DataPenelaahanLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDataPenelaahanStore } from '@/store/useDataPenelaahanStore';
import {
    VerificationTransaction
} from '@/api/verification';
import { useVerificationTransactions, useAllVerificationToponyms } from '@/hooks/useVerification';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import Link from 'next/link';

const DataPenelaahanVerifikatorContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token } = useAuth();

    const [activeTab, setActiveTab] = useState<'semua' | 'toponim'>('semua');
    const { searchText, setSearchText, transactionPage, setTransactionPage, viewMode, setViewMode } = useDataPenelaahanStore();

    // Sync viewMode with URL params
    useEffect(() => {
        const viewFromUrl = searchParams.get('view') as 'grid' | 'table' | null;
        if (viewFromUrl && (viewFromUrl === 'grid' || viewFromUrl === 'table')) {
            setViewMode(viewFromUrl);
        }
    }, [searchParams, setViewMode]);

    // API Hooks
    const { data: transactionsRes, isLoading: loadingTransactions, refetch: refetchTransactions } = useVerificationTransactions(token, { page: transactionPage, per_page: 10 });
    const { data: toponymsRes, isLoading: loadingToponyms } = useAllVerificationToponyms(token, { page: 1 });

    const transactions = useMemo(() => transactionsRes?.data || [], [transactionsRes]);
    const transactionPagination = useMemo(() => transactionsRes?.pagination, [transactionsRes]);
    const allToponyms = useMemo(() => {
        const data = toponymsRes?.data || [];
        return data.map((item: any, idx: number) => ({
            id: item.id,
            no: idx + 1,
            date: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
            element: item.element?.name || "-",
            name: item.map_name || item.local_name || "-",
            surveyor: item.creator?.name || "-",
            status: item.review_transaction_data?.[0]?.accepted === true ? "Disetujui" : item.review_transaction_data?.[0]?.accepted === false ? "Ditolak" : "Belum Ditelaah",
            transactionId: item.review_transaction_toponyms?.[0]?.transaction_id || ""
        }));
    }, [toponymsRes]);

    useEffect(() => {
        if (activeTab === 'semua') refetchTransactions();
    }, [activeTab, refetchTransactions]);

    const filteredTransactions = useMemo(() => {
        if (!searchText) return transactions;
        return transactions.filter((t: VerificationTransaction) => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [transactions, searchText]);

    const filteredToponyms = useMemo(() => {
        if (!searchText) return allToponyms;
        return allToponyms.filter((t: any) => t.name.toLowerCase().includes(searchText.toLowerCase()) || t.element.toLowerCase().includes(searchText.toLowerCase()));
    }, [allToponyms, searchText]);

    const transactionColumns: ColumnDef<VerificationTransaction>[] = [
        { header: "No", cell: (_, idx) => (transactionPage - 1) * 10 + idx + 1, className: "w-12 text-center" },
        { header: "Rentang Penelaahan", cell: (row) => row.due_at ? new Date(row.due_at).toLocaleDateString("id-ID") : "-", className: "w-40" },
        { header: "Judul Penelaahan", accessorKey: "title" },
        { header: "Jumlah Data Ditelaah", accessorKey: "total_data", className: "text-center w-32" },
        { header: "Jumlah Disetujui", accessorKey: "accepted_data", className: "text-center w-28" },
        { header: "Jumlah Ditolak", accessorKey: "rejected_data", className: "text-center w-28" },
        {
            header: "Status", cell: (row) => {
                const isRecommended = row.status === 'recommended' || !!row.news;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isRecommended ? 'bg-emerald-100 text-emerald-700' : row.status === 'completed' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {isRecommended ? 'Selesai' : row.status === 'completed' ? 'Cetak BA' : 'Proses Penelaahan'}
                    </span>
                );
            }
        },
        {
            header: "Aksi", className: "w-16 text-center", cell: (row) => (
                <div className="flex justify-center">
                    <button onClick={() => router.push(`/v2/verifikator-kota/data-penelaahan/detail?transactionId=${row.id}&view=${viewMode}`)} className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md">
                        <Search size={18} />
                    </button>
                </div>
            )
        }
    ];

    const toponymColumns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal", accessorKey: "date", className: "w-32" },
        { header: "Jenis Unsur", accessorKey: "element" },
        { header: "Nama Rupabumi", accessorKey: "name" },
        { header: "Surveyor", accessorKey: "surveyor" },
        {
            header: "Status", cell: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${row.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : row.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Aksi", className: "w-16 text-center", cell: (row) => (
                <div className="flex justify-center">
                    <button onClick={() => router.push(`/v2/verifikator-kota/data-penelaahan/detail/${row.id}?transactionId=${row.transactionId}&reviewed=${row.status !== 'Belum Ditelaah'}`)} className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md">
                        <Search size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Data Penelaahan</h1>
                <Link href={"/v2/verifikator-kota/data-penelaahan/buat"}>
                    <ButtonComponent label="Buat Penelaahan" icon={<Plus size={20} />}/>
                </Link>
            </div>

            <div className="flex items-center border-b border-gray-100">
                <button onClick={() => setActiveTab('semua')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'semua' ? 'border-navy-500 text-navy-500' : 'border-transparent text-gray-500'}`}>
                    Semua Penelaahan ({transactionPagination?.total ?? transactions.length})
                </button>
                <button onClick={() => { setActiveTab('toponim'); setSearchText(""); }} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'toponim' ? 'border-navy-500 text-navy-500' : 'border-transparent text-gray-500'}`}>
                    Semua Toponim ({allToponyms.length})
                </button>
            </div>

            {activeTab === 'semua' ? (
                <DataPenelaahanLayout
                    loadingTransactions={loadingTransactions}
                    filteredTransactions={filteredTransactions}
                    token={token}
                    refetchTransactions={refetchTransactions}
                    transactionPagination={transactionPagination}
                    transactionColumns={transactionColumns}
                />
            ) : (
                <DataTable columns={toponymColumns} data={filteredToponyms} isLoading={loadingToponyms} showSearch={true} showFilter={true} />
            )}
        </div>
    );
};

const DataPenelaahanVerifikator = () => {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Memuat halaman penelaahan...</p>
                </div>
            }>
                <DataPenelaahanVerifikatorContent />
            </Suspense>
        </DashboardLayout>
    );
};

export default DataPenelaahanVerifikator;
