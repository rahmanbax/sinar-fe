"use client";

import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import VerifikatorKotaLayout from '@/components/v2/nav/VerifikatorKotaLayout'
import { Database, MapPin, Plus } from 'lucide-react';
import React from 'react'

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
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-sm font-bold text-navy-900 mb-8">Kandidat Jenis Unsur</h3>

                    <div className="space-y-6 flex-1">
                        {[
                            { name: 'Gunung', value: 20, max: 20 },
                            { name: 'Bukit', value: 15, max: 20 },
                            { name: 'Stadion', value: 10, max: 20 },
                            { name: 'Candi', value: 10, max: 20 },
                            { name: 'Laut', value: 2, max: 20 },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 w-16 shrink-0">{item.name}</span>
                                <div className="flex-1 h-3.5 bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#4bb1cc] rounded-r-full"
                                        style={{ width: `${(item.value / item.max) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* x-axis labels */}
                    <div className="flex justify-between pl-20 pr-2 mt-auto text-xs text-gray-600 font-medium pt-3 border-t border-gray-200/60">
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                    </div>
                </div>

                {/* Map View */}
                <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden min-h-[350px] relative">
                    <iframe
                        title="Peta Persebaran"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=95.00976562500001%2C-11.178401873711785%2C141.06445312500003%2C6.227933930268688&amp;layer=mapnik"
                        className="w-full h-full absolute inset-0 border-0"
                    ></iframe>
                </div>
            </div>
        </VerifikatorKotaLayout>
    )
}

export default VerifikatorKotaPage