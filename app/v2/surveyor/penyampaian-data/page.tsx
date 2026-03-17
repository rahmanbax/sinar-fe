"use client";

import React, { useState } from 'react';
import SurveyorLayout from '@/components/v2/nav/SurveyorLayout';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import { Plus, Search, SlidersHorizontal, Download, Map as MapIcon } from 'lucide-react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';

interface DeliveryData {
    id: number | string;
    no: number;
    created_at: string;
    source: string;
    total_data: number;
    accepted_data: number;
    rejected_data: number;
}

const mockDeliveryData: DeliveryData[] = [
    { id: 1, no: 1, created_at: '05/02/2026', source: 'Poly2.zip', total_data: 500, accepted_data: 0, rejected_data: 0 },
    { id: 2, no: 2, created_at: '05/02/2026', source: 'Poly2.zip', total_data: 500, accepted_data: 0, rejected_data: 0 },
    { id: 3, no: 3, created_at: '05/02/2026', source: 'Poly2.zip', total_data: 500, accepted_data: 0, rejected_data: 0 },
    { id: 4, no: 4, created_at: '05/02/2026', source: 'Poly2.zip', total_data: 500, accepted_data: 0, rejected_data: 0 },
    { id: 5, no: 5, created_at: '05/02/2026', source: 'Poly2.zip', total_data: 500, accepted_data: 0, rejected_data: 0 },
];

const DataDeliveryPage = () => {
    const [loading] = useState(false);

    const columns: ColumnDef<DeliveryData>[] = [
        { header: "No", accessorKey: "no", className: "w-16 text-center" },
        { header: "Tanggal Dibuat", accessorKey: "created_at", className: "w-48" },
        { header: "Sumber Data", accessorKey: "source", className: "w-64" },
        { header: "Jumlah Data", accessorKey: "total_data", className: "w-40" },
        { header: "Data Diterima", accessorKey: "accepted_data", className: "w-40" },
        { header: "Data Ditolak", accessorKey: "rejected_data", className: "w-40" },
        { 
            header: "Aksi", 
            className: "w-24 text-center",
            cell: () => (
                <div className="flex justify-center">
                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group">
                        <Search size={16} className="text-gray-400 group-hover:text-navy-900 transition-colors" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <SurveyorLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <h1 className="text-2xl font-bold text-navy-900">Data Saya</h1>
                <ButtonComponent
                    label="Buat Penyampaian Data"
                    onClick={() => {}}
                    icon={<Plus size={18} />}
                    className="bg-[#083551] hover:bg-[#062a41] px-6 py-2.5 rounded-lg"
                />
            </div>

            <div className="bg-white rounded-xl">
                <DataTable
                    columns={columns}
                    data={mockDeliveryData}
                    isLoading={loading}
                    showSearch={true}
                    showFilter={true}
                    showDownload={true}
                    showMap={true}
                    onSearch={() => {}}
                    onFilter={() => {}}
                    onDownload={() => {}}
                    onMap={() => {}}
                    pagination={{
                        total: 5,
                        per_page: 5,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: 5
                    }}
                />
            </div>
        </SurveyorLayout>
    );
};

export default DataDeliveryPage;
