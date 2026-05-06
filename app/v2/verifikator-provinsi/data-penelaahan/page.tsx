"use client";

import React, { useState, useMemo, Suspense } from 'react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search, SlidersHorizontal, Check, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationTransactions, useAllVerificationToponyms, useFinishVerificationTransaction } from '@/hooks/useVerification';
import { useBeritaAcaraData } from '@/hooks/useBeritaAcara';
import Link from 'next/link';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

// Components matches the Verifikator Kota style
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
            onClick={() => router.push(`/v2/verifikator-provinsi/data-penelaahan/detail?transactionId=${item.id}&view=${viewMode}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase whitespace-nowrap ${
                    isRecommended ? 'text-emerald-600 bg-white border-emerald-400' :
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
                            router.push(`/v2/verifikator-provinsi/data-penelaahan/cetak-ba?transactionId=${item.id}`); 
                        }
                    }}
                >
                    <FileText size={16} /> Lihat Berita Acara
                </button>
            ) : isCompleted ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white transition-all flex items-center justify-center gap-2" 
                    onClick={(e) => { e.stopPropagation(); router.push(`/v2/verifikator-provinsi/data-penelaahan/cetak-ba?transactionId=${item.id}`); }}>
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

const VerifikatorProvinsiDataPenelaahanContent = () => {
    const router = useRouter();
    const { token } = useAuth();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const viewFromUrl = searchParams.get('view') as 'grid' | 'table' | null;
    const viewMode = viewFromUrl || 'grid';

    const [activeTab, setActiveTab] = useState<'semua' | 'toponim'>('semua');
    const [searchText, setSearchText] = useState("");
    const [toponymPage, setToponymPage] = useState(1);

    // API Hooks
    const { data: transactionsRes, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useVerificationTransactions(token);
    const { data: toponymsRes, isLoading: isLoadingToponyms } = useAllVerificationToponyms(token, { page: toponymPage, per_page: 10 });

    const transactions = useMemo(() => transactionsRes?.data ?? [], [transactionsRes]);
    const toponyms = useMemo(() => toponymsRes?.data ?? [], [toponymsRes]);
    const toponymPagination = useMemo(() => toponymsRes?.pagination, [toponymsRes]);

    const setViewMode = (mode: 'grid' | 'table') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', mode);
        router.replace(`/v2/verifikator-provinsi/data-penelaahan?${params.toString()}`, { scroll: false });
    };

    const filteredTransactions = useMemo(() => {
        if (!searchText) return transactions;
        return transactions.filter((t: any) => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText, transactions]);

    const filteredToponyms = useMemo(() => {
        // Since API doesn't have search, we filter locally for the current page
        if (!searchText) return toponyms;
        return toponyms.filter((t: any) => 
            t.name?.toLowerCase().includes(searchText.toLowerCase()) || 
            t.element_name?.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, toponyms]);

    const transactionColumns: ColumnDef<any>[] = [
        { header: "No", cell: (_, idx) => idx + 1, className: "w-12 text-center" },
        { header: "Rentang Penelaahan", cell: (row) => row.due_at ? new Date(row.due_at).toLocaleDateString("id-ID") : "-", className: "w-40" },
        { header: "Judul Penelaahan", accessorKey: "title" },
        { header: "Jumlah Data Ditelaah", accessorKey: "total_data", className: "text-center w-32" },
        { header: "Jumlah Disetujui", accessorKey: "accepted_data", className: "text-center w-28" },
        { header: "Jumlah Ditolak", accessorKey: "rejected_data", className: "text-center w-28" },
        {
            header: "Status", cell: (row) => {
                const isRecommended = row.status === 'recommended' || !!row.news;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isRecommended ? 'bg-emerald-100 text-emerald-700' : 
                        row.status === 'completed' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                        {isRecommended ? 'Selesai' : row.status === 'completed' ? 'Cetak BA' : 'Proses Penelaahan'}
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
        { header: "Jenis Unsur", accessorKey: "element_name" },
        { header: "Nama Rupabumi", accessorKey: "name", className: "font-bold" },
        { header: "Surveyor", accessorKey: "surveyor_name" },
        {
            header: "Status", cell: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    row.status_num === 1 ? 'bg-emerald-100 text-emerald-700' : 
                    row.status_num === 2 ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {row.status_label || (row.status_num === 1 ? "Disetujui" : row.status_num === 2 ? "Ditolak" : "Belum Ditelaah")}
                </span>
            )
        },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => (
                <div className="flex justify-center">
                    <button 
                        onClick={() => router.push(`/v2/verifikator-provinsi/data-penelaahan/toponym/${row.id}`)} 
                        className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <Search size={18} />
                    </button>
                </div>
            )
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
                <h1 className="text-2xl font-bold text-navy-900">Data Penelaahan</h1>
                <ButtonComponent 
                    label="Buat Penelaahan" 
                    icon={<Plus size={18} />} 
                    className="bg-navy-900 hover:bg-navy-800"
                    onClick={() => router.push('/v2/verifikator-provinsi/data-penelaahan/buat')} 
                />
            </div>

            {/* Tabs per Design */}
            <div className="flex items-center border-b border-gray-100">
                <button onClick={() => setActiveTab('semua')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'semua' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                    Semua Penelaahan ({transactions.length})
                </button>
                <button onClick={() => { setActiveTab('toponim'); setSearchText(""); }} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'toponim' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                    Semua Toponim ({toponymPagination?.total || 0})
                </button>
            </div>

            {activeTab === 'semua' ? (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg min-w-[300px] border border-gray-100 shadow-sm">
                                <Search size={16} className="text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari penelaahan..." 
                                    value={searchText} 
                                    onChange={(e) => setSearchText(e.target.value)} 
                                    className="bg-transparent text-sm w-full outline-none" 
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-bold text-navy-700 border border-gray-100 shadow-sm">
                                <SlidersHorizontal size={16} /> Filter
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="6" height="16" rx="1" /><rect x="14" y="4" width="6" height="8" rx="1" opacity="0.6" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>
                             </button>
                             <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>
                             </button>
                        </div>
                    </div>
                    
                    {isLoadingTransactions ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-64 animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                                {filteredTransactions.map((item: any) => (
                                    <ReviewCard key={item.id} item={item} token={token} onRefresh={refetchTransactions} viewMode={viewMode} />
                                ))}
                            </div>
                        ) : (
                            <div className="pb-12">
                                <DataTable columns={transactionColumns} data={filteredTransactions} isLoading={isLoadingTransactions} showSearch={false} showFilter={false} />
                            </div>
                        )
                    )}
                </>
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
            )}
        </div>
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
