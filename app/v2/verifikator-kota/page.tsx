"use client";

import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import VerifikatorKotaLayout from '@/components/v2/nav/VerifikatorKotaLayout'
import { Database, MapPin, Plus } from 'lucide-react';
import React from 'react'
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap';
import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart';

const VerifikatorKotaPage = () => {
    return (
        <VerifikatorKotaLayout>
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 mb-1">Halo, John Doe</h1>
                    <p className="text-gray-500 text-sm">Berikut adalah ringkasan data yang telah anda kumpulkan.</p>
                </div>
                <ButtonComponent
                    label="Buat Penelaahan"
                    onClick={() => { }}
                    icon={<Plus size={16} />}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { value: '120', label: 'Total Data yang Dikumpulkan', icon: Database },
                    { value: '70', label: 'Data Survey', icon: MapPin },
                    { value: '40', label: 'Data Antara', icon: MapPin },
                    { value: '10', label: 'Data yang Dibakukan', icon: MapPin },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-navy-900 mb-1">{stat.value}</h3>
                                <p className="text-[13px] text-gray-500 font-medium pr-4 leading-tight">{stat.label}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                <Icon size={20} className="text-navy-900" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                {/* Bar Chart Candidate */}
                <HorizontalBarChart
                    title="Kandidat Jenis Unsur"
                    items={[
                        { name: 'Gunung', value: 20, max: 20 },
                        { name: 'Bukit', value: 15, max: 20 },
                        { name: 'Stadion', value: 10, max: 20 },
                        { name: 'Candi', value: 10, max: 20 },
                        { name: 'Laut', value: 2, max: 20 },
                    ]}
                    xLabels={[5, 10, 15, 20]}
                />

                {/* Map View */}
                <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden min-h-[350px] relative">
                    <MiniIndonesiaMap />
                </div>
            </div>
        </VerifikatorKotaLayout>
    )
}

export default VerifikatorKotaPage