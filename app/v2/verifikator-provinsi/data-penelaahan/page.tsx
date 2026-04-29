"use client";

import React, { useState, useMemo, Suspense } from 'react';
import VerifikatorProvinsiLayout from '@/components/v2/nav/VerifikatorProvinsiLayout';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search, SlidersHorizontal, Check, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- DUMMY DATA ---
const DUMMY_TRANSACTIONS = [
    {
        id: "1",
        title: "Penelaahan Februari",
        status: "issued", // Proses Penelaahan
        due_at: "2026-02-28T00:00:00Z",
        element_count: 5,
        district_count: 2,
        total_data: 20,
        handled_data: 15,
        accepted_data: 10,
        rejected_data: 5,
        verificator_count: 2,
    },
    {
        id: "2",
        title: "Penelaahan Februari",
        status: "completed", // Cetak BA
        due_at: "2026-02-28T00:00:00Z",
        element_count: 5,
        district_count: 2,
        total_data: 20,
        handled_data: 20,
        accepted_data: 15,
        rejected_data: 5,
        verificator_count: 2,
    },
    {
        id: "3",
        title: "Penelaahan Februari",
        status: "recommended", // Selesai
        due_at: "2026-02-28T00:00:00Z",
        element_count: 5,
        district_count: 2,
        total_data: 20,
        handled_data: 20,
        accepted_data: 15,
        rejected_data: 5,
        verificator_count: 2,
    },
    {
        id: "4",
        title: "Penelaahan Februari",
        status: "recommended", // Selesai
        due_at: "2026-02-28T00:00:00Z",
        element_count: 5,
        district_count: 2,
        total_data: 20,
        handled_data: 20,
        accepted_data: 15,
        rejected_data: 5,
        verificator_count: 2,
    }
];

const DUMMY_TOPONYMS = Array.from({ length: 15 }).map((_, idx) => ({
    id: `tp-${idx}`,
    no: idx + 1,
    date: "05/02/2026",
    element: idx % 2 === 0 ? "Candi" : "Gunung",
    name: idx % 2 === 0 ? "Candi Borobudur" : "Gunung Merapi",
    surveyor: "John Doe",
    status: idx % 3 === 0 ? "Disetujui" : idx % 3 === 1 ? "Ditolak" : "Belum Ditelaah",
    transactionId: "1"
}));

// Components matches the Verifikator Kota style
const ReviewCard = ({ item, viewMode }: { item: any; viewMode: string }) => {
    const router = useRouter();

    const isCompleted = item.status === 'completed';
    const isRecommended = item.status === 'recommended';
    const isIssued = item.status === 'issued';
    const isVerificationDone = item.total_data > 0 && item.total_data === item.handled_data;

    const progressPercent = Math.round(((item.handled_data || 0) / (item.total_data || 1)) * 100);

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer group"
            onClick={() => router.push(`/v2/verifikator-provinsi/data-penelaahan/detail?transactionId=${item.id}&view=${viewMode}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase whitespace-nowrap ${isRecommended ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                    isCompleted ? 'text-orange-500 bg-orange-50 border-orange-200' :
                        isIssued ? 'text-blue-600 bg-blue-50 border-blue-200' :
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
                    <span className="text-gray-900">{item.verificator_count}</span>
                    <span className="text-gray-500 text-xs">Verifikator</span>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8 mt-auto">
                <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        {/* Red Part (Rejected) */}
                        <circle cx="48" cy="48" r="40" stroke="#EF4444" strokeWidth="8" fill="transparent" 
                            strokeDasharray={251.2} 
                            strokeDashoffset={251.2 - (251.2 * (item.accepted_data + item.rejected_data)) / (item.total_data || 1)} 
                            strokeLinecap="round" />
                        {/* Green Part (Accepted) */}
                        <circle cx="48" cy="48" r="40" stroke="#10B981" strokeWidth="8" fill="transparent" 
                            strokeDasharray={251.2} 
                            strokeDashoffset={251.2 - (251.2 * item.accepted_data) / (item.total_data || 1)} 
                            strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{progressPercent}%</span>
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
                    {item.total_data - item.handled_data > 0 && (
                         <div className="flex items-center gap-2 font-semibold">
                         <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                         <span className="text-[11px] text-gray-900 w-4">{item.total_data - item.handled_data}</span>
                         <span className="text-[11px] text-gray-400">Data Belum Ditelaah</span>
                     </div>
                    )}
                </div>
            </div>

            {isRecommended ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2" 
                    onClick={(e) => { e.stopPropagation(); }}>
                    Lihat Berita Acara
                </button>
            ) : isCompleted ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white transition-all flex items-center justify-center gap-2" 
                    onClick={(e) => { e.stopPropagation(); }}>
                    Cetak Berita Acara
                </button>
            ) : isVerificationDone ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2" 
                    onClick={(e) => { e.stopPropagation(); }}>
                    <Check size={16} /> Tandai Selesai
                </button>
            ) : (
                <div className="h-[42px]"></div> // Placeholder if no action
            )}
        </div>
    );
};

const VerifikatorProvinsiDataPenelaahanContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const viewFromUrl = searchParams.get('view') as 'grid' | 'table' | null;
    const viewMode = viewFromUrl || 'grid';

    const [activeTab, setActiveTab] = useState<'semua' | 'toponim'>('semua');
    const [searchText, setSearchText] = useState("");

    const setViewMode = (mode: 'grid' | 'table') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', mode);
        router.replace(`/v2/verifikator-provinsi/data-penelaahan?${params.toString()}`, { scroll: false });
    };

    const filteredTransactions = useMemo(() => {
        if (!searchText) return DUMMY_TRANSACTIONS;
        return DUMMY_TRANSACTIONS.filter(t => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText]);

    const filteredToponyms = useMemo(() => {
        if (!searchText) return DUMMY_TOPONYMS;
        return DUMMY_TOPONYMS.filter(t => 
            t.name.toLowerCase().includes(searchText.toLowerCase()) || 
            t.element.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText]);

    const transactionColumns: ColumnDef<any>[] = [
        { header: "No", cell: (_, idx) => idx + 1, className: "w-12 text-center" },
        { header: "Rentang Penelaahan", cell: (row) => row.due_at ? new Date(row.due_at).toLocaleDateString("id-ID") : "-", className: "w-40" },
        { header: "Judul Penelaahan", accessorKey: "title" },
        { header: "Jumlah Data Ditelaah", accessorKey: "total_data", className: "text-center w-32" },
        { header: "Jumlah Disetujui", accessorKey: "accepted_data", className: "text-center w-28" },
        { header: "Jumlah Ditolak", accessorKey: "rejected_data", className: "text-center w-28" },
        {
            header: "Status", cell: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    row.status === 'recommended' ? 'bg-emerald-100 text-emerald-700' : 
                    row.status === 'completed' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                    {row.status === 'recommended' ? 'Selesai' : row.status === 'completed' ? 'Cetak BA' : 'Proses Penelaahan'}
                </span>
            )
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
        { header: "No", accessorKey: "no", className: "w-12 text-center" },
        { header: "Tanggal", accessorKey: "date", className: "w-32" },
        { header: "Jenis Unsur", accessorKey: "element" },
        { header: "Nama Rupabumi", accessorKey: "name", className: "font-bold" },
        { header: "Surveyor", accessorKey: "surveyor" },
        {
            header: "Status", cell: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    row.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 
                    row.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {row.status}
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
                    Semua Penelaahan ({DUMMY_TRANSACTIONS.length})
                </button>
                <button onClick={() => { setActiveTab('toponim'); setSearchText(""); }} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'toponim' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                    Semua Toponim ({DUMMY_TOPONYMS.length})
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
                    
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                            {filteredTransactions.map((item) => (
                                <ReviewCard key={item.id} item={item} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : (
                        <div className="pb-12">
                            <DataTable columns={transactionColumns} data={filteredTransactions} isLoading={false} showSearch={false} showFilter={false} />
                        </div>
                    )}
                </>
            ) : (
                <div className="pb-12">
                     <DataTable columns={toponymColumns} data={filteredToponyms} isLoading={false} showSearch={true} showFilter={true} />
                </div>
            )}
        </div>
    );
};

const VerifikatorProvinsiDataPenelaahan = () => {
    return (
        <VerifikatorProvinsiLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Memuat halaman penelaahan...</p>
                </div>
            }>
                <VerifikatorProvinsiDataPenelaahanContent />
            </Suspense>
        </VerifikatorProvinsiLayout>
    );
};

export default VerifikatorProvinsiDataPenelaahan;
