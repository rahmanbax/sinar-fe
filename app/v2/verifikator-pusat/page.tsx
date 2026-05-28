"use client";

import { Database } from 'lucide-react';
import React, { useMemo } from 'react'
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart';
import { useVerificationCandidates } from '@/hooks/useVerification';

const VerifikatorPusatPage = () => {
    const { token, user } = useAuth();
    const { data: candidatesRes, isLoading } = useVerificationCandidates(token);

    const chartData = useMemo(() => {
        if (!candidatesRes?.data) return [];

        const maxVal = Math.max(...candidatesRes.data.map(c => c.count));

        return candidatesRes.data.map(candidate => ({
            name: candidate.element_name,
            value: candidate.count,
            max: maxVal
        })).slice(0, 5);
    }, [candidatesRes]);
    
    return (
        <DashboardLayout>
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Halo, {user?.name}</h1>
                    <p className="text-gray-500 text-sm">Berikut adalah ringkasan data yang perlu ditelaah.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { value: '15.420', label: 'Total Data', icon: Database },
                    { value: '4.200', label: 'Data Belum Ditelaah', icon: Database },
                    { value: '8.600', label: 'Data Dalam Proses Penelaahan', icon: Database },
                    { value: '2.620', label: 'Data Sudah Ditelaah', icon: Database },
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

                {/* Horizontal Bar Chart (Jenis Unsur Terbanyak) */}
                <HorizontalBarChart
                    title="Kandidat Jenis Unsur"
                    items={chartData}
                    isLoading={isLoading}
                />

                {/* Map Preview Area */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[350px] relative">
                    <MiniIndonesiaMap />
                </div>
            </div>
        </DashboardLayout>
    )
}

export default VerifikatorPusatPage;
