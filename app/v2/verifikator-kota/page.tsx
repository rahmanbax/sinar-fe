"use client";

import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { Database, MapPin, Plus } from 'lucide-react';
import React, { useMemo } from 'react'
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap';
import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationCandidates } from '@/hooks/useVerification';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

const VerifikatorKotaPage = () => {
    const { token } = useAuth();
    const { data: candidatesRes, isLoading } = useVerificationCandidates(token);

    const chartData = useMemo(() => {
        if (!candidatesRes?.data) return [];

        const maxVal = Math.max(...candidatesRes.data.map(c => c.count), 5); // Default min max to 5 if data is small

        return candidatesRes.data.map(candidate => ({
            name: candidate.element_name,
            value: candidate.count,
            max: maxVal
        })).slice(0, 5); // Just show top 5
    }, [candidatesRes]);
    return (
        <DashboardLayout>
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
                    items={chartData}
                    isLoading={isLoading}
                />

                {/* Map View */}
                <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden min-h-[350px] relative">
                    <MiniIndonesiaMap />
                </div>
            </div>
        </DashboardLayout>
    )
}

export default VerifikatorKotaPage