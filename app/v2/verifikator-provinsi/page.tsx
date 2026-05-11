"use client";

import { Database } from 'lucide-react';
import React from 'react'
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const VerifikatorProvinsiPage = () => {
    const { user } = useAuth();
    return (
        <DashboardLayout>
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Halo, {user?.name}</h1>
                    <p className="text-gray-500 text-sm">Berikut adalah ringkasan data yang telah anda kumpulkan.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { value: '3200', label: 'Total Data', icon: Database },
                    { value: '1200', label: 'Data Belum Ditelaah', icon: Database },
                    { value: '1600', label: 'Data Dalam Proses Penelaahan', icon: Database },
                    { value: '400', label: 'Data Sudah Ditelaah', icon: Database },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold  mb-1">{stat.value}</h3>
                                <p className="text-[13px] text-gray-500 font-medium pr-2 leading-tight">{stat.label}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                <Icon size={20} className="" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">

                {/* Horizontal Bar Chart (Jenis Unsur) */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-sm font-bold  mb-8">Jenis Unsur</h3>

                    <div className="space-y-6 flex-1 pr-6">
                        {[
                            { name: 'Gunung', value: 20, max: 20 },
                            { name: 'Bukit', value: 15, max: 20 },
                            { name: 'Stadion', value: 10, max: 20 },
                            { name: 'Candi', value: 10, max: 20 },
                            { name: 'Laut', value: 4, max: 20 },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 w-16 shrink-0 font-medium">{item.name}</span>
                                <div className="flex-1 h-3.5 bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#4bb1cc] rounded-r-full"
                                        style={{ width: `${(item.value / item.max) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* X-axis indicators */}
                    <div className="flex justify-between pl-20 pr-1 mt-auto text-xs text-gray-600 font-medium pt-3 border-t border-gray-200/60">
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                    </div>
                </div>

                {/* Map Preview Area */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[350px] relative">
                    <MiniIndonesiaMap />
                </div>
            </div>
        </DashboardLayout>
    )
}

export default VerifikatorProvinsiPage
