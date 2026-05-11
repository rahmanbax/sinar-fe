"use client";

import React, { useMemo } from 'react';
import { Plus, Database, MapPin } from 'lucide-react';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap';
import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalPerformance } from '@/hooks/usePersonal';
import { useSurveyBoundingBox } from '@/hooks/useToponyms';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import Link from 'next/link';

const SurveyorPage = () => {
    const { token, user } = useAuth();
    const { data: performanceRes, isLoading } = usePersonalPerformance(token);
    const { data: boundingBoxRes } = useSurveyBoundingBox(token);

    const stats = useMemo(() => {
        const d = performanceRes?.data?.summary;
        return [
            { value: d?.submitted_data ?? '-', label: 'Total Data yang Dikumpulkan', icon: Database },
            { value: d?.survey_data ?? '-', label: 'Data Survey', icon: MapPin },
            { value: d?.antara_data ?? '-', label: 'Data Antara', icon: MapPin },
            { value: d?.standarized ?? '-', label: 'Data yang Dibakukan', icon: MapPin },
        ];
    }, [performanceRes]);

    const chartData = useMemo(() => {
        if (!performanceRes?.data?.five_top_elements) return [];
        const maxVal = Math.max(...performanceRes.data.five_top_elements.map(e => e.count), 5);
        return performanceRes.data.five_top_elements.map(e => ({
            name: e.element_name,
            value: e.count,
            max: maxVal
        }));
    }, [performanceRes]);

    const markers = useMemo(() => {
        if (!boundingBoxRes?.data?.results) return [];
        return boundingBoxRes.data.results.map((item) => ({
            longitude: item.lng,
            latitude: item.lat,
            color: item.status === 'baku' ? '#053378' : '#DEB43F',
            label: item.map_name || item.local_name,
        }));
    }, [boundingBoxRes]);

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
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 flex items-start justify-between">
                            <div>
                                {isLoading ? (
                                    <div className="w-12 h-6 bg-gray-200 rounded animate-pulse mb-1" />
                                ) : (
                                    <h3 className="text-2xl font-bold  mb-1">{stat.value}</h3>
                                )}
                                <p className="text-sm text-gray-500 font-medium pr-4 leading-tight">{stat.label}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                <Icon size={20} className="" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                {/* Bar Chart Candidate */}
                <HorizontalBarChart
                    title="5 Jenis Unsur Teratas"
                    items={chartData}
                    isLoading={isLoading}
                />

                {/* Map View */}
                <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden min-h-[350px] relative">
                    <MiniIndonesiaMap markers={markers} />
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SurveyorPage;