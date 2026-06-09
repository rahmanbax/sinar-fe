"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import HorizontalBarChart, { HorizontalBarChartItem } from "@/components/v2/charts/HorizontalBarChart";
import TextInput from "@/components/v2/inputs/TextInput";
import CalendarInput from "@/components/v2/inputs/CalendarInput";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const dummyChartData: HorizontalBarChartItem[] = [
    { name: "Gunung", value: 20, max: 20 },
    { name: "Bukit", value: 15, max: 20 },
    { name: "Stadion", value: 10, max: 20 },
    { name: "Candi", value: 10, max: 20 },
    { name: "Laut", value: 5, max: 20 },
];

export default function BuatPengumumanPage() {
    const [noRegistrasi, setNoRegistrasi] = useState("");
    const [tanggalMulai, setTanggalMulai] = useState("");
    const [tanggalAkhir, setTanggalAkhir] = useState("");

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Link href="/v2/big" className="hover:text-gray-900 transition-colors">Dashboard</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <Link href="/v2/big/pengumuman" className="hover:text-gray-900 transition-colors">Pengumuman</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-400">Buat Pengumuman</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">Buat Pengumuman</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left Panel: Charts */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <HorizontalBarChart
                                title="Jenis Unsur"
                                items={dummyChartData}
                                className="border-none shadow-none"
                                color="#4CB3CF"
                            />
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <HorizontalBarChart
                                title="Provinsi"
                                items={dummyChartData}
                                className="border-none shadow-none"
                                color="#4CB3CF"
                            />
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
                        <TextInput
                            id="noRegistrasi"
                            label="No. Registrasi"
                            value={noRegistrasi}
                            onChange={(e) => setNoRegistrasi(e.target.value)}
                            placeholder="Masukkan No. Registrasi"
                        />
                        <CalendarInput
                            id="tanggalMulai"
                            label="Tanggal Mulai"
                            value={tanggalMulai}
                            onChange={(e) => setTanggalMulai(e.target.value)}
                        />
                        <CalendarInput
                            id="tanggalAkhir"
                            label="Tanggal Selesai"
                            value={tanggalAkhir}
                            onChange={(e) => setTanggalAkhir(e.target.value)}
                        />

                        <button 
                            className="w-full bg-[#A3A3A3] text-white font-semibold py-2.5 rounded-lg mt-2 cursor-not-allowed"
                            disabled
                        >
                            Buat Pengumuman
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
