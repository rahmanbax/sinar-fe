"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import VerifikatorKotaLayout from '@/components/v2/nav/VerifikatorKotaLayout';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search, SlidersHorizontal, Check, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
    getVerificationTransactions, 
    getAllVerificationToponyms, 
    finishVerificationTransaction,
    VerificationTransaction 
} from '@/api/verification';
import { useRouter, useSearchParams } from 'next/navigation';

// Sub-component for individual review cards
const ReviewCard = ({ 
    item,
    token,
    onRefresh,
    viewMode
}: { 
    item: VerificationTransaction; 
    token: string | null;
    onRefresh: () => void;
    viewMode: string;
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isCompleted = item.status === 'completed';
    const isIssued = item.status === 'issued';
    const isVerificationDone = item.total_data > 0 && item.total_data === item.handled_data;

    const handleFinish = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSubmitting) return;
        
        if (!confirm(`Apakah Anda yakin ingin menandai penelaahan "${item.title}" sebagai selesai? Data yang sudah selesai tidak dapat diubah lagi.`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await finishVerificationTransaction(token, item.id);
            if (!res.error) {
                onRefresh();
            } else {
                alert(res.message || "Gagal menyelesaikan penelaahan");
            }
        } catch (err) {
            alert("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer group"
            onClick={() => router.push(`/v2/verifikator-kota/data-penelaahan/detail?transactionId=${item.id}&view=${viewMode}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase whitespace-nowrap ${
                    isCompleted ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                    isIssued ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                    'text-gray-500 bg-gray-50 border-gray-100'
                }`}>
                    {isCompleted ? 'Selesai' : isIssued ? 'Proses Penelaahan' : item.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-6">
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.element_count}</span>
                    <span className="text-gray-500 text-xs">Jenis Unsur</span>
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
                    <span className="text-gray-500 text-xs">Data Ditelaah</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold col-span-2">
                    <span className="text-gray-900">{item.verificator_count}</span>
                    <span className="text-gray-500 text-xs">Verifikator</span>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8 mt-auto">
                <div className="relative w-22 h-22 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle cx="44" cy="44" r="36" stroke="#EF4444" strokeWidth="8" fill="transparent" strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * (item.accepted_data + item.rejected_data)) / (item.total_data || 1)} strokeLinecap="round" />
                        <circle cx="44" cy="44" r="36" stroke="#10B981" strokeWidth="8" fill="transparent" strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * item.accepted_data) / (item.total_data || 1)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{Math.round(((item.handled_data || 0) / (item.total_data || 1)) * 100)}%</span>
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

            {isVerificationDone && !isCompleted ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2" onClick={handleFinish} disabled={isSubmitting}>
                    <Check size={16} /> {isSubmitting ? "Memproses..." : "Tandai Selesai"}
                </button>
            ) : isCompleted ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2" onClick={(e) => { e.stopPropagation(); router.push(`/v2/verifikator-kota/data-penelaahan/cetak-ba?transactionId=${item.id}`); }}>
                    <FileText size={16} /> Lihat Berita Acara
                </button>
            ) : (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all">Proses Penelaahan</button>
            )}
        </div>
    );
};

const DataPenelaahanVerifikatorContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token } = useAuth();
    
    // Sync viewMode with URL params
    const viewFromUrl = searchParams.get('view') as 'grid' | 'table' | null;
    const viewMode = viewFromUrl || 'grid';
    
    const [activeTab, setActiveTab] = useState<'semua' | 'toponim'>('semua');
    const [searchText, setSearchText] = useState("");
    
    // Transactions State
    const [transactions, setTransactions] = useState<VerificationTransaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);

    // Toponyms State
    const [allToponyms, setAllToponyms] = useState<any[]>([]);
    const [loadingToponyms, setLoadingToponyms] = useState(false);

    const setViewMode = (mode: 'grid' | 'table') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', mode);
        router.replace(`/v2/verifikator-kota/data-penelaahan?${params.toString()}`, { scroll: false });
    };

    const fetchTransactions = useCallback(async () => {
        setLoadingTransactions(true);
        try {
            const res = await getVerificationTransactions(token); 
            if (!res.error) {
                setTransactions(res.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTransactions(false);
        }
    }, [token]);

    const fetchAllToponyms = useCallback(async () => {
        setLoadingToponyms(true);
        try {
            const res = await getAllVerificationToponyms(token, { page: 1, per_page: 9999 });
            if (!res.error) {
                const transformed = res.data?.map((item: any, idx: number) => ({
                    id: item.id,
                    no: idx + 1,
                    date: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
                    element: item.element?.name || "-",
                    name: item.map_name || item.local_name || "-",
                    surveyor: item.creator?.name || "-",
                    status: item.review_transaction_data?.[0]?.accepted === true ? "Disetujui" : item.review_transaction_data?.[0]?.accepted === false ? "Ditolak" : "Belum Ditelaah"
                }));
                setAllToponyms(transformed || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingToponyms(false);
        }
    }, [token]);

    useEffect(() => {
        if (activeTab === 'semua') fetchTransactions();
        else fetchAllToponyms();
    }, [activeTab, fetchTransactions, fetchAllToponyms]);

    const filteredTransactions = useMemo(() => {
        if (!searchText) return transactions;
        return transactions.filter(t => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [transactions, searchText]);

    const filteredToponyms = useMemo(() => {
        if (!searchText) return allToponyms;
        return allToponyms.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()) || t.element.toLowerCase().includes(searchText.toLowerCase()));
    }, [allToponyms, searchText]);

    const transactionColumns: ColumnDef<VerificationTransaction>[] = [
        { header: "No", cell: (_, idx) => idx + 1, className: "w-12 text-center" },
        { header: "Rentang Penelaahan", cell: (row) => row.due_at ? new Date(row.due_at).toLocaleDateString("id-ID") : "-", className: "w-40" },
        { header: "Judul Penelaahan", accessorKey: "title" },
        { header: "Jumlah Data Ditelaah", accessorKey: "total_data", className: "text-center w-32" },
        { header: "Jumlah Disetujui", accessorKey: "accepted_data", className: "text-center w-28" },
        { header: "Jumlah Ditolak", accessorKey: "rejected_data", className: "text-center w-28" },
        { header: "Status", cell: (row) => (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                row.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
                {row.status === 'completed' ? 'Selesai' : 'Proses Penelaahan'}
            </span>
        )},
        { header: "Aksi", className: "w-16 text-center", cell: (row) => (
            <div className="flex justify-center">
                <button onClick={() => router.push(`/v2/verifikator-kota/data-penelaahan/detail?transactionId=${row.id}&view=${viewMode}`)} className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md">
                    <Search size={18} />
                </button>
            </div>
        )}
    ];

    const toponymColumns: ColumnDef<any>[] = [
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal", accessorKey: "date", className: "w-32" },
        { header: "Jenis Unsur", accessorKey: "element" },
        { header: "Nama Rupabumi", accessorKey: "name" },
        { header: "Surveyor", accessorKey: "surveyor" },
        { header: "Status", cell: (row) => (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                row.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : row.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
            }`}>
                {row.status}
            </span>
        )},
        { header: "Aksi", className: "w-16 text-center", cell: (row) => (
            <div className="flex justify-center">
                <button onClick={() => router.push(`/v2/verifikator-kota/data-penelaahan/toponim/${row.id}`)} className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md">
                    <Search size={18} />
                </button>
            </div>
        )}
    ];

    return (
        <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-navy-900">Data Penelaahan</h1>
                    <ButtonComponent label="Buat Penelaahan" icon={<Plus size={18} />} onClick={() => router.push('/v2/verifikator-kota/data-penelaahan/buat')} />
                </div>

                <div className="flex items-center border-b border-gray-100">
                    <button onClick={() => setActiveTab('semua')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'semua' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                        Semua Penelaahan ({transactions.length})
                    </button>
                    <button onClick={() => { setActiveTab('toponim'); setSearchText(""); }} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'toponim' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                        Semua Toponim ({allToponyms.length})
                    </button>
                </div>

                {activeTab === 'semua' ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg min-w-[300px] border border-gray-100 shadow-sm">
                                    <Search size={16} className="text-gray-400" />
                                    <input type="text" placeholder="Cari penelaahan..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="bg-transparent text-sm w-full outline-none" />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-bold text-navy-700 border border-gray-100 shadow-sm">
                                    <SlidersHorizontal size={16} /> Filter
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="6" height="16" rx="2" /><rect x="14" y="4" width="6" height="8" rx="2" opacity="0.8" /><rect x="14" y="14" width="6" height="6" rx="2" opacity="1" /></svg></button>
                                <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg></button>
                            </div>
                        </div>
                        {loadingTransactions ? (
                            <div className="flex justify-center py-20"><p className="text-gray-400 animate-pulse">Memuat data...</p></div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-10">
                                {filteredTransactions.map((item) => (
                                    <ReviewCard key={item.id} item={item} token={token} onRefresh={fetchTransactions} viewMode={viewMode} />
                                ))}
                            </div>
                        ) : (
                            <div className="pb-10"><DataTable columns={transactionColumns} data={filteredTransactions} isLoading={loadingTransactions} showSearch={false} showFilter={false} /></div>
                        )}
                    </>
                ) : (
                    <DataTable columns={toponymColumns} data={filteredToponyms} isLoading={loadingToponyms} showSearch={true} showFilter={true} />
                )}
            </div>
    );
};

const DataPenelaahanVerifikator = () => {
    return (
        <VerifikatorKotaLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Memuat halaman penelaahan...</p>
                </div>
            }>
                <DataPenelaahanVerifikatorContent />
            </Suspense>
        </VerifikatorKotaLayout>
    );
};

export default DataPenelaahanVerifikator;
