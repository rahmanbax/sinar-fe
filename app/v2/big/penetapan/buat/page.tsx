"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import HorizontalBarChart, { HorizontalBarChartItem } from "@/components/v2/charts/HorizontalBarChart";
import TextInput from "@/components/v2/inputs/TextInput";
import DropdownInput from "@/components/v2/inputs/DropdownInput";
import Link from "next/link";
import { File } from "lucide-react";

const dummyChartData: HorizontalBarChartItem[] = [
    { name: "Gunung", value: 20, max: 20 },
    { name: "Bukit", value: 15, max: 20 },
    { name: "Stadion", value: 10, max: 20 },
    { name: "Candi", value: 10, max: 20 },
    { name: "Laut", value: 5, max: 20 },
];

export default function BuatPenetapanPage() {
    const [noRegistrasi, setNoRegistrasi] = useState("");
    const [noSk, setNoSk] = useState("");
    const [gazeter, setGazeter] = useState("");
    const [jenisUnsur, setJenisUnsur] = useState("");
    const [provinsi, setProvinsi] = useState("");
    const [jumlahData, setJumlahData] = useState("0");

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Link href="/v2/big" className="hover:text-gray-900 transition-colors">Dashboard</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <Link href="/v2/big/penetapan" className="hover:text-gray-900 transition-colors">Penetapan</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-400">Buat Penetapan</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">Buat Penetapan</h1>

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
                        <TextInput
                            id="noSk"
                            label="No. SK Penetapan"
                            value={noSk}
                            onChange={(e) => setNoSk(e.target.value)}
                            placeholder="Masukkan No. Registrasi"
                        />
                        
                        {/* Unggah Surat Upload Box */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-semibold text-gray-900">Unggah Surat</span>
                            <button className="w-full flex flex-col items-center justify-center gap-2 h-24 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:bg-gray-50 transition cursor-pointer">
                                <File size={24} />
                                <span className="text-sm">Klik untuk unggah Surat</span>
                            </button>
                        </div>

                        <DropdownInput
                            label="Gazeter"
                            value={gazeter}
                            onChange={setGazeter}
                            options={[
                                { value: "gazeter_a", label: "Gazeter A" }
                            ]}
                            placeholder="Pilih Gazeter"
                        />

                        <DropdownInput
                            label="Jenis Unsur"
                            value={jenisUnsur}
                            onChange={setJenisUnsur}
                            options={[
                                { value: "gunung", label: "Gunung" }
                            ]}
                            placeholder="Pilih Jenis Unsur"
                        />

                        <DropdownInput
                            label="Provinsi"
                            value={provinsi}
                            onChange={setProvinsi}
                            options={[
                                { value: "jabar", label: "Jawa Barat" }
                            ]}
                            placeholder="Pilih Provinsi"
                        />

                        <TextInput
                            id="jumlahData"
                            label="Jumlah Data"
                            value={jumlahData}
                            onChange={(e) => setJumlahData(e.target.value)}
                            disabled
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
