"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

const DUMMY_TRANSACTION_HEADER = {
    id: 'tx-1',
    title: 'Penelaahan 07/05/2026',
    status: 'issued',
    created_at: '2026-05-07T00:00:00Z',
};

const DUMMY_TRANSACTION_TOPONYMS = [
    {
        id: 'top-1',
        created_at: '2026-05-07T08:00:00Z',
        element: { name: 'Arena/Stadion/Bangunan Olah Raga' },
        specific_element: 'Gasibu',
        province: { name: 'JAWA BARAT' },
        regency: { name: 'BANDUNG' },
        creator: { name: 'Surveyor 1' },
        assigned_to: 'Verifikator I',
        location_point: { coordinates: [107.619, -6.900] },
    },
];

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
);

const DataPenelaahanDetailContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const transactionId = searchParams.get('transactionId');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const columns: ColumnDef<any>[] = [
        { header: "No", cell: (_, idx) => idx + 1, className: "w-12 text-center" },
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
                        onClick={() => router.push(`/v2/verifikator-pusat/data-penelaahan/detail/${row.id}?transactionId=${transactionId}`)}
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
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 text-gray-500 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">{DUMMY_TRANSACTION_HEADER.title}</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard value={1} label="Jenis Unsur" />
                <StatCard value={1} label="Provinsi" />
                <StatCard value={1} label="Total Data" />
                <StatCard value={1} label="Data Sudah Ditelaah" />
                <StatCard value={0} label="Verifikator" />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
                <DataTable
                    columns={columns}
                    data={DUMMY_TRANSACTION_TOPONYMS}
                    showSearch={true}
                    showFilter={true}
                />
            </div>
        </div>
    );
};

const VerifikatorPusatDataPenelaahanDetail = () => {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Memuat detail penelaahan...</p>
                </div>
            }>
                <DataPenelaahanDetailContent />
            </Suspense>
        </DashboardLayout>
    );
};

export default VerifikatorPusatDataPenelaahanDetail;
