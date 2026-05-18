"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search, SlidersHorizontal, Check, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

// Mock Data for National Verifier
const DUMMY_TRANSACTIONS = [
    {
        id: 'tx-1',
        title: 'Penelaahan Nasional Tahap 1 - 2026',
        due_at: '2026-12-31',
        status: 'issued',
        total_data: 500,
        handled_data: 120,
        accepted_data: 100,
        rejected_data: 20,
        element_count: 15,
        district_count: 45,
        verificator_count: 5,
        accepted_rate: 83,
        rejected_rate: 17
    },
    {
        id: 'tx-2',
        title: 'Verifikasi Toponim Pulau Jawa',
        due_at: '2026-10-15',
        status: 'completed',
        total_data: 1200,
        handled_data: 1200,
        accepted_data: 1100,
        rejected_data: 100,
        element_count: 25,
        district_count: 120,
        verificator_count: 12,
        accepted_rate: 92,
        rejected_rate: 8
    }
];

const DUMMY_TOPONYMS = [
    {
        id: 'top-1',
        created_at: '2026-05-01T08:00:00Z',
        element: { name: 'Gunung' },
        specific_element: 'Semeru',
        province: { name: 'JAWA TIMUR' },
        regency: { name: 'LUMAJANG' },
        creator: { name: 'Surveyor Nasional 1' },
        assigned_to: 'Verifikator Pusat A',
        location_point: { coordinates: [112.922, -8.108] },
        review_transaction_toponyms: [{ transaction_id: 'tx-1', accepted: true, user: { verification_permission_level: 5 } }]
    },
    {
        id: 'top-2',
        created_at: '2026-05-02T09:30:00Z',
        element: { name: 'Sungai' },
        specific_element: 'Bengawan Solo',
        province: { name: 'JAWA TENGAH' },
        regency: { name: 'SURAKARTA' },
        creator: { name: 'Surveyor Jawa Tengah' },
        assigned_to: 'Verifikator Pusat B',
        location_point: { coordinates: [110.829, -7.566] },
        review_transaction_toponyms: [{ transaction_id: 'tx-1', accepted: false, user: { verification_permission_level: 5 } }]
    },
    {
        id: 'top-3',
        created_at: '2026-05-03T10:15:00Z',
        element: { name: 'Tanjung' },
        specific_element: 'Priok',
        province: { name: 'DKI JAKARTA' },
        regency: { name: 'JAKARTA UTARA' },
        creator: { name: 'Surveyor DKI' },
        assigned_to: '-',
        location_point: { coordinates: [106.879, -6.103] },
        review_transaction_toponyms: [] // Belum ditelaah
    }
];

const ReviewCard = ({
    item,
    viewMode
}: {
    item: any;
    viewMode: string
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isCompleted = item.status === 'completed';
    const isIssued = item.status === 'issued';
    const isVerificationDone = item.total_data > 0 && item.total_data === item.handled_data;

    const progressPercent = Math.round(((item.handled_data || 0) / (item.total_data || 1)) * 100);

    const handleFinish = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSubmitting) return;
        alert("Fungsi ini akan tersedia setelah API dihubungkan.");
    };

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer group"
            onClick={() => router.push(`/v2/verifikator-pusat/data-penelaahan/detail?transactionId=${item.id}&view=${viewMode}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase whitespace-nowrap ${
                    isCompleted ? 'text-orange-500 bg-white border-orange-400' :
                        isIssued ? 'text-blue-600 bg-white border-blue-400' :
                            'text-gray-500 bg-gray-50 border-gray-100'
                    }`}>
                    {isCompleted ? 'Cetak BA' : isIssued ? 'Proses Penelaahan' : item.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-6">
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.element_count}</span>
                    <span className="text-gray-500 text-xs text-nowrap">Jenis Unsur</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.district_count}</span>
                    <span className="text-gray-500 text-xs">Wilayah</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.total_data}</span>
                    <span className="text-gray-500 text-xs">Total Data</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-semibold">
                    <span className="text-gray-900">{item.handled_data}</span>
                    <span className="text-gray-500 text-xs text-nowrap">Data Ditelaah</span>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8 mt-auto">
                <div className="relative w-22 h-22 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle cx="44" cy="44" r="36" stroke="#EF4444" strokeWidth="8" fill="transparent"
                            strokeDasharray={226.2}
                            strokeDashoffset={226.2 - (226.2 * (item.accepted_data + item.rejected_data)) / (item.total_data || 1)}
                            strokeLinecap="round" />
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
                        <span className="text-[11px] text-gray-400">Disetujui</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[11px] text-gray-900 w-4">{item.rejected_data}</span>
                        <span className="text-[11px] text-gray-400">Ditolak</span>
                    </div>
                </div>
            </div>

            {isCompleted ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white transition-all flex items-center justify-center gap-2"
                    onClick={(e) => { e.stopPropagation(); alert("Fitur Cetak BA akan segera hadir."); }}>
                    <FileText size={16} /> Cetak Berita Acara
                </button>
            ) : isVerificationDone ? (
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2"
                    onClick={handleFinish} disabled={isSubmitting}>
                    <Check size={16} /> Tandai Selesai
                </button>
            ) : (
                <div className="h-[42px]"></div>
            )}
        </div>
    );
};

const VerifikatorPusatDataPenelaahanContent = () => {
    const router = useRouter();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const viewFromUrl = searchParams.get('view') as 'grid' | 'table' | null;
    const viewMode = viewFromUrl || 'grid';

    const [activeTab, setActiveTab] = useState<'semua' | 'toponim'>('semua');
    const [searchText, setSearchText] = useState("");
    const [toponymPage, setToponymPage] = useState(1);

    const transactions = DUMMY_TRANSACTIONS;
    const toponyms = DUMMY_TOPONYMS;
    const toponymPagination = { total: toponyms.length, per_page: 10, current_page: 1, last_page: 1, from: 1, to: toponyms.length };

    const setViewMode = (mode: 'grid' | 'table') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', mode);
        router.replace(`/v2/verifikator-pusat/data-penelaahan?${params.toString()}`, { scroll: false });
    };

    const filteredTransactions = useMemo(() => {
        if (!searchText) return transactions;
        return transactions.filter((t: any) => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText, transactions]);

    const filteredToponyms = useMemo(() => {
        if (!searchText) return toponyms;
        const s = searchText.toLowerCase();
        return toponyms.filter((t: any) => {
            const name = t.specific_element || t.name || "";
            const element = t.element?.name || "";
            return name.toLowerCase().includes(s) || element.toLowerCase().includes(s);
        });
    }, [searchText, toponyms]);

    const transactionColumns: ColumnDef<any>[] = [
        { header: "No", cell: (_, idx) => idx + 1, className: "w-12 text-center" },
        { header: "Rentang Penelaahan", cell: (row) => row.due_at ? new Date(row.due_at).toLocaleDateString("id-ID") : "-", className: "w-40" },
        { header: "Judul Penelaahan", accessorKey: "title" },
        { header: "Jumlah Data", accessorKey: "total_data", className: "text-center w-32" },
        { header: "Jumlah Disetujui", accessorKey: "accepted_data", className: "text-center w-28" },
        { header: "Jumlah Ditolak", accessorKey: "rejected_data", className: "text-center w-28" },
        {
            header: "Status", cell: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    row.status === 'completed' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                    {row.status === 'completed' ? 'Cetak BA' : 'Proses Penelaahan'}
                </span>
            )
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
        { header: "Tanggal Diajukan", cell: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "-", className: "w-32" },
        { header: "Jenis Unsur", cell: (row) => row.element?.name || "-" },
        { header: "Nama Rupabumi", cell: (row) => row.specific_element || "-", className: "font-bold" },
        { header: "Provinsi", cell: (row) => row.province?.name || "-" },
        { header: "Kabupaten/ Kota", cell: (row) => row.regency?.name || "-" },
        { header: "Surveyor", cell: (row) => row.creator?.name || "-" },
        { header: "Ditugaskan ke", cell: (row) => row.assigned_to || "-" },
        { header: "Koordinat", cell: (row) => row.location_point ? `${row.location_point.coordinates[0].toFixed(3)}, ${row.location_point.coordinates[1].toFixed(3)}` : "-" },
        {
            header: "Aksi",
            className: "w-16 text-center",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => router.push(`/v2/verifikator-pusat/data-penelaahan/detail/${row.id}`)}
                        className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <Search size={18} />
                    </button>
                </div>
            )
        }
    ];

    if (!mounted) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Data Penelaahan Pusat</h1>
                <ButtonComponent
                    label="Buat Penelaahan"
                    icon={<Plus size={18} />}
                    onClick={() => router.push('/v2/verifikator-pusat/data-penelaahan/buat')}
                />
            </div>

            <div className="flex items-center border-b border-gray-100">
                <button onClick={() => setActiveTab('semua')} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'semua' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                    Semua Penelaahan ({transactions.length})
                </button>
                <button onClick={() => { setActiveTab('toponim'); setSearchText(""); }} className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'toponim' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                    Semua Toponim ({toponyms.length})
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
                            {filteredTransactions.map((item: any) => (
                                <ReviewCard key={item.id} item={item} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : (
                        <div className="pb-12">
                            <DataTable columns={transactionColumns} data={filteredTransactions} showSearch={false} showFilter={false} />
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <DataTable
                        columns={toponymColumns}
                        data={filteredToponyms}
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
