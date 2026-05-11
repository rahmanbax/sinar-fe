"use client";

import React, { useMemo } from 'react';
import { Database, Book } from 'lucide-react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationCandidates } from '@/hooks/useVerification';
import { useSurveyBoundingBox } from '@/hooks/useToponyms';

const AdminBigPage = () => {
    const { user, token, isLoading: isLoadingAuth } = useAuth();
    const { data: candidatesRes, isLoading: isLoadingCandidates } = useVerificationCandidates(token);
    const { data: boundingBoxRes } = useSurveyBoundingBox(token);

    const topElements = useMemo(() => {
        if (!candidatesRes?.data) {
            // Placeholder data if no API response
            return [
                { name: 'Gunung', count: 10 },
                { name: 'Bukit', count: 10 },
                { name: 'Stadion', count: 10 },
                { name: 'Candi', count: 10 },
                { name: 'Laut', count: 10 },
            ];
        }
        return candidatesRes.data.slice(0, 5).map(c => ({
            name: c.element_name,
            count: c.count
        }));
    }, [candidatesRes]);

    const markers = useMemo(() => {
        if (!boundingBoxRes?.data?.results) return [];
        return boundingBoxRes.data.results.map((item) => ({
            longitude: item.lng,
            latitude: item.lat,
            color: item.status === 'baku' ? '#053378' : '#DEB43F',
            label: item.map_name || item.local_name,
        }));
    }, [boundingBoxRes]);

    const stats = [
        { value: '10000', label: 'Total Data', icon: Database },
        { value: '2500', label: 'Data Belum Diumumkan', icon: Database },
        { value: '7500', label: 'Data Sudah Diumumkan', icon: Database },
        { value: '10', label: 'Total Gazeter', icon: Book },
    ];

    return (
        <DashboardLayout>
            <div className="mb-8">
                {isLoadingAuth ? (
                    <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-1" />
                ) : (
                    <h1 className="text-2xl font-bold  mb-1">Halo, {user?.name || 'User'}</h1>
                )}
                <p className="text-gray-500 text-sm">Berikut adalah ringkasan data yang perlu ditelaah.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 flex items-start justify-between shadow-sm">
                            <div>
                                <h3 className="text-2xl font-bold  mb-1">{stat.value}</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-tight">{stat.label}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                <Icon size={20} className="" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
                {/* 5 Jenis Unsur Teratas */}
                <div className="lg:col-span-4 bg-gray-50/50 rounded-xl border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-sm font-bold  mb-6">5 Jenis Unsur Teratas</h3>

                    <div className="space-y-3 flex-1">
                        {isLoadingCandidates ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border border-gray-100 animate-pulse h-16" />
                            ))
                        ) : topElements.map((item, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-center">
                                <span className="text-xl font-bold ">{item.count}</span>
                                <span className="text-sm text-gray-500 font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map View */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px] relative shadow-sm">
                    <MiniIndonesiaMap markers={markers} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminBigPage;