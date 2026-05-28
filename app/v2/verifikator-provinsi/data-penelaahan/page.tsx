"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search, Check, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationTransactions, useAllVerificationToponyms, useFinishVerificationTransaction } from '@/hooks/useVerification';
import { useBeritaAcaraData } from '@/hooks/useBeritaAcara';
import Link from 'next/link';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import DataPenelaahanLayout from '@/components/v2/layout/DataPenelaahanLayout';
import { useDataPenelaahanStore } from '@/store/useDataPenelaahanStore';

const VerifikatorProvinsiDataPenelaahanContent = () => {
    const router = useRouter();
    const { token } = useAuth();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [activeTab, setActiveTab] = useState<'semua' | 'toponim'>('semua');
    const { searchText, setSearchText, transactionPage, setTransactionPage, viewMode, setViewMode } = useDataPenelaahanStore();
    const [toponymPage, setToponymPage] = useState(1);

    // API Hooks
    const { data: transactionsRes, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useVerificationTransactions(token, { page: transactionPage, per_page: 10 });
    const { data: toponymsRes, isLoading: isLoadingToponyms, refetch: refetchToponyms } = useAllVerificationToponyms(token, { page: toponymPage });

    useEffect(() => {
        refetchTransactions();
    }, [transactionPage, refetchTransactions]);

    useEffect(() => {
        refetchToponyms();
    }, [toponymPage, refetchToponyms]);

    const transactions = useMemo(() => transactionsRes?.data ?? [], [transactionsRes]);
    const transactionPagination = useMemo(() => transactionsRes?.pagination, [transactionsRes]);
    const toponyms = useMemo(() => toponymsRes?.data ?? [], [toponymsRes]);
    const toponymPagination = useMemo(() => toponymsRes?.pagination, [toponymsRes]);

    // Sync viewMode from URL to Zustand
    useEffect(() => {
        const viewFromUrl = searchParams.get('view') as 'card' | 'table' | null;
        if (viewFromUrl && (viewFromUrl === 'card' || viewFromUrl === 'table')) {
            setViewMode(viewFromUrl);
        }
    }, [searchParams, setViewMode]);

    const filteredTransactions = useMemo(() => {
        if (!searchText) return transactions;
        return transactions.filter((t: any) => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText, transactions]);

    const filteredToponyms = useMemo(() => {
        // Since API doesn't have search, we filter locally for the current page
        if (!searchText) return toponyms;
        const s = searchText.toLowerCase();
        return toponyms.filter((t: any) => {
            const name = t.specific_element || t.map_name || t.local_name || t.name || "";
            const element = t.element?.name || t.element_name || "";
            const surveyor = t.creator?.name || t.surveyor_name || "";
            return name.toLowerCase().includes(s) ||
                element.toLowerCase().includes(s) ||
                surveyor.toLowerCase().includes(s);
        });
    }, [searchText, toponyms]);

    const transactionColumns: ColumnDef<any>[] = [
        { header: "No", cell: (_, idx) => (transactionPage - 1) * 10 + idx + 1, className: "w-12 text-center" },
        { header: "Rentang Penelaahan", cell: (row) => row.due_at ? new Date(row.due_at).toLocaleDateString("id-ID") : "-", className: "w-40" },
        { header: "Judul Penelaahan", accessorKey: "title" },
        { header: "Jumlah Data Ditelaah", accessorKey: "total_data", className: "text-center w-32" },
        { header: "Jumlah Disetujui", accessorKey: "accepted_data", className: "text-center w-28" },
        { header: "Jumlah Ditolak", accessorKey: "rejected_data", className: "text-center w-28" },
        {
            header: "Status", cell: (row) => {
                const hasBA = !!row.ba_file_url;
                const isSelesai = row.status === 'recommended' || !!row.news;
                const isRekomendasi = row.status === 'completed' && hasBA;
                const isCetakBA = row.status === 'completed' && !hasBA;

                let colorClass = 'bg-gray-100 text-gray-600';
                if (isSelesai) {
                    colorClass = 'bg-emerald-100 text-emerald-700';
                } else if (isRekomendasi) {
                    colorClass = 'bg-blue-50 text-blue-600';
                } else if (isCetakBA) {
                    colorClass = 'bg-orange-100 text-orange-600';
                }

                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${colorClass}`}>
                        {isSelesai ? 'Selesai' : isRekomendasi ? 'Rekomendasi' : isCetakBA ? 'Cetak BA' : 'Proses Penelaahan'}
                    </span>
                );
            }
        },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => router.push(`/v2/verifikator-provinsi/data-penelaahan/detail?transactionId=${row.id}&view=${viewMode}`)}
                        className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <Search size={18} />
                    </button>
                </div>
            )
        }
    ];

    const toponymColumns: ColumnDef<any>[] = [
        { header: "No", cell: (_, idx) => (toponymPage - 1) * 10 + idx + 1, className: "w-12 text-center" },
        { header: "Tanggal", cell: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "-", className: "w-32" },
        { header: "Jenis Unsur", cell: (row) => row.element?.name || row.element_name || "-" },
        { header: "Nama Rupabumi", cell: (row) => row.specific_element || row.map_name || row.local_name || row.name || "-" },
        { header: "Surveyor", cell: (row) => row.creator?.name || row.surveyor_name || "-" },
        {
            header: "Status", cell: (row) => {
                // Provincial Verifier is level 3 or 4 usually. 
                // We look for reviews from users with verification_permission_level >= 3
                const provReview = row.review_transaction_toponyms?.find((r: any) => (r.user?.verification_permission_level || 0) >= 3);

                const statusLabel = row.status_label || (provReview ? (provReview.accepted ? "Disetujui" : "Ditolak") : "Belum Ditelaah");
                const isAccepted = provReview ? provReview.accepted : (row.status_num === 1);
                const isRejected = provReview ? !provReview.accepted : (row.status_num === 2);

                return (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isAccepted ? 'bg-emerald-100 text-emerald-700' :
                        isRejected ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {statusLabel}
                    </span>
                );
            }
        },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => {
                const transactionId = row.review_transaction_toponyms?.[0]?.transaction_id;
                const provReview = row.review_transaction_toponyms?.find((r: any) => (r.user?.verification_permission_level || 0) >= 3);
                const isReviewed = provReview != null || row.status_num === 1 || row.status_num === 2;
                return (
                    <div className="flex justify-center">
                        <button
                            onClick={() => router.push(`/v2/verifikator-provinsi/data-penelaahan/detail/${row.id}?${transactionId ? `transactionId=${transactionId}&` : ''}reviewed=${isReviewed}`)}
                            className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                );
            }
        }
    ];

    if (!mounted) return (
        <div className="flex flex-col gap-6">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Data Penelaahan</h1>
                <Link href="/v2/verifikator-provinsi/data-penelaahan/buat">
                    <ButtonComponent
                        label="Buat Penelaahan"
                        icon={<Plus size={20} />}
                    />
                </Link>
            </div>

            {/* Tabs per Design */}
            <div className="flex items-center border-b border-gray-100">
                <button onClick={() => setActiveTab('semua')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'semua' ? 'border-navy-500 text-navy-500' : 'border-transparent text-gray-400'}`}>
                    Semua Penelaahan ({transactionPagination?.total ?? transactions.length})
                </button>
                <button onClick={() => { setActiveTab('toponim'); setSearchText(""); }} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'toponim' ? 'border-navy-500 text-navy-500' : 'border-transparent text-gray-400'}`}>
                    Semua Toponim ({toponymPagination?.total || 0})
                </button>
            </div>

            {
                activeTab === 'semua' ? (
                    <DataPenelaahanLayout
                        loadingTransactions={isLoadingTransactions}
                        filteredTransactions={filteredTransactions}
                        token={token}
                        refetchTransactions={refetchTransactions}
                        transactionPagination={transactionPagination}
                        transactionColumns={transactionColumns}
                    />
                ) : (
                    <div className="pb-12">
                        <DataTable
                            columns={toponymColumns}
                            data={filteredToponyms}
                            isLoading={isLoadingToponyms}
                            showSearch={true}
                            showFilter={true}
                            pagination={toponymPagination}
                            onPageChange={setToponymPage}
                        />
                    </div>
                )
            }
        </div >
    );
};

const VerifikatorProvinsiDataPenelaahan = () => {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Memuat halaman penelaahan...</p>
                </div>
            }>
                <VerifikatorProvinsiDataPenelaahanContent />
            </Suspense>
        </DashboardLayout>
    );
};

export default VerifikatorProvinsiDataPenelaahan;
