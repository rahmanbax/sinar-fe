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

const ReviewCard = ({
    item,
    token,
    onRefresh,
    viewMode
}: {
    item: any;
    token: string | null;
    onRefresh: () => void;
    viewMode: string
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const finishMutation = useFinishVerificationTransaction();

    const isCompleted = item.status === 'completed';
    const isIssued = item.status === 'issued';
    const isVerificationDone = item.total_data > 0 && item.total_data === item.handled_data;

    // Check if BA exists for completed transactions
    const { data: baData } = useBeritaAcaraData(token, isCompleted ? item.id : null);
    const hasBA = !!baData?.ba_file_url;

    const isRecommended = item.status === 'recommended' || hasBA;

    const progressPercent = Math.round(((item.handled_data || 0) / (item.total_data || 1)) * 100);

    const handleFinish = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSubmitting) return;

        if (!confirm(`Apakah Anda yakin ingin menandai penelaahan "${item.title}" sebagai selesai? Data yang sudah selesai tidak dapat diubah lagi.`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            await finishMutation.mutateAsync({ token, transactionId: item.id });
            onRefresh();
        } catch (err) {
            alert("Gagal menyelesaikan penelaahan. Terjadi kesalahan koneksi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer group"
            onClick={() => router.push(`/v2/verifikator-pusat/data-penelaahan/detail?transactionId=${item.id}&view=${viewMode}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase whitespace-nowrap ${isRecommended ? 'text-emerald-600 bg-white border-emerald-400' :
                    isCompleted ? 'text-orange-500 bg-white border-orange-400' :
                        isIssued ? 'text-blue-600 bg-white border-blue-400' :
                            'text-gray-500 bg-gray-50 border-gray-100'
                    }`}>
                    {isRecommended ? 'Selesai' : isCompleted ? 'Cetak BA' : isIssued ? 'Proses Penelaahan' : item.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-6">
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.element_count}</span>
                    <span className="text-gray-500 text-xs text-nowrap">Jenis Unsur</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.district_count}</span>
                    <span className="text-gray-500 text-xs">Kecamatan</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.total_data}</span>
                    <span className="text-gray-500 text-xs">Total Data</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.handled_data}</span>
                    <span className="text-gray-500 text-xs text-nowrap">Data Ditelaah</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold col-span-2">
                    <span className="text-gray-900">{item.verificator_count || 0}</span>
                    <span className="text-gray-500 text-xs">Verifikator</span>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8 mt-auto">
                <div className="relative w-22 h-22 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        {/* Red Part (Rejected) */}
                        <circle cx="44" cy="44" r="36" stroke="#EF4444" strokeWidth="8" fill="transparent"
                            strokeDasharray={226.2}
                            strokeDashoffset={226.2 - (226.2 * (item.accepted_data + item.rejected_data)) / (item.total_data || 1)}
                            strokeLinecap="round" />
                        {/* Green Part (Accepted) */}
                        <circle cx="44" cy="44" r="36" stroke="#10B981" strokeWidth="8" fill="transparent"
                            strokeDasharray={226.2}
                            strokeDashoffset={226.2 - (226.2 * item.accepted_data) / (item.total_data || 1)}
                            strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{progressPercent}%</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-semibold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[11px] text-gray-900 w-4">{item.accepted_data}</span>
                        <span className="text-[11px] text-gray-400">Data Disetujui</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[11px] text-gray-900 w-4">{item.rejected_data}</span>
                        <span className="text-[11px] text-gray-400">Data Ditolak</span>
                    </div>
                </div>
            </div>

            {isRecommended ? (
                <button
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (baData?.ba_file_url) {
                            window.open(baData.ba_file_url, '_blank');
                        } else {
                            router.push(`/v2/verifikator-pusat/data-penelaahan/cetak-ba?transactionId=${item.id}`);
                        }
                    }}
                >
                    <FileText size={16} /> Lihat Berita Acara
                </button>
            ) : isCompleted ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white transition-all flex items-center justify-center gap-2"
                    onClick={(e) => { e.stopPropagation(); router.push(`/v2/verifikator-pusat/data-penelaahan/cetak-ba?transactionId=${item.id}`); }}>
                    <FileText size={16} /> Cetak Berita Acara
                </button>
            ) : isVerificationDone ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2"
                    onClick={handleFinish} disabled={isSubmitting}>
                    <Check size={16} /> {isSubmitting ? "Memproses..." : "Tandai Selesai"}
                </button>
            ) : (
                <div className="h-[42px]"></div> // Placeholder if no action
            )}
        </div>
    );
};

const VerifikatorPusatDataPenelaahanContent = () => {
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
    const { data: toponymsRes, isLoading: isLoadingToponyms } = useAllVerificationToponyms(token, { page: toponymPage, });

    const transactions = useMemo(() => transactionsRes?.data ?? [], [transactionsRes]);
    const transactionPagination = useMemo(() => transactionsRes?.pagination, [transactionsRes]);
    const toponyms = useMemo(() => toponymsRes?.data ?? [], [toponymsRes]);
    const toponymPagination = useMemo(() => toponymsRes?.pagination, [toponymsRes]);

    // Sync viewMode from URL to Zustand
    useEffect(() => {
        const viewFromUrl = searchParams.get('view') as 'grid' | 'table' | null;
        if (viewFromUrl && (viewFromUrl === 'grid' || viewFromUrl === 'table')) {
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
                        onClick={() => router.push(`/v2/verifikator-pusat/data-penelaahan/detail?transactionId=${row.id}&view=${viewMode}`)}
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
                // Verifikator Pusat is usually level 5. 
                const pusatReview = row.review_transaction_toponyms?.find((r: any) => (r.user?.verification_permission_level || 0) >= 5);

                const statusLabel = row.status_label || (pusatReview ? (pusatReview.accepted ? "Disetujui" : "Ditolak") : "Belum Ditelaah");
                const isAccepted = pusatReview ? pusatReview.accepted : (row.status_num === 1);
                const isRejected = pusatReview ? !pusatReview.accepted : (row.status_num === 2);

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
                const pusatReview = row.review_transaction_toponyms?.find((r: any) => (r.user?.verification_permission_level || 0) >= 5);
                const isReviewed = pusatReview != null || row.status_num === 1 || row.status_num === 2;
                return (
                    <div className="flex justify-center">
                        <button
                            onClick={() => router.push(`/v2/verifikator-pusat/data-penelaahan/detail/${row.id}?${transactionId ? `transactionId=${transactionId}&` : ''}reviewed=${isReviewed}`)}
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
                <h1 className="text-2xl font-bold">Data Penelaahan Pusat</h1>
                <Link href="/v2/verifikator-pusat/data-penelaahan/buat">
                    <ButtonComponent
                        label="Buat Penelaahan"
                        icon={<Plus size={18} />}
                    />
                </Link>
            </div>

            {/* Tabs per Design */}
            <div className="flex items-center border-b border-gray-100">
                <button onClick={() => setActiveTab('semua')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'semua' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                    Semua Penelaahan ({transactionPagination?.total ?? transactions.length})
                </button>
                <button onClick={() => { setActiveTab('toponim'); setSearchText(""); }} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'toponim' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
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

const VerifikatorPusatDataPenelaahan = () => {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Memuat halaman penelaahan...</p>
                </div>
            }>
                <VerifikatorPusatDataPenelaahanContent />
            </Suspense>
        </DashboardLayout>
    );
};

export default VerifikatorPusatDataPenelaahan;
