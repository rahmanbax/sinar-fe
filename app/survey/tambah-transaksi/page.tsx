"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SurveyorLayout from '@/layouts/SurveryorLayout'
import { Check } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'

const TambahTransaksiPage = () => {
    const [fullTab, setFulltab] = useState(false)
    const navbarRef = useRef<HTMLDivElement>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [currentStep, setCurrentStep] = useState(1)

    // Form state - Step 1
    const [namaKegiatan, setNamaKegiatan] = useState('')
    const [tanggalMulai, setTanggalMulai] = useState('')
    const [tanggalHingga, setTanggalHingga] = useState('')
    const [jenisPerolehan, setJenisPerolehan] = useState('')

    // Form state - Step 2
    const [jenisGeometri, setJenisGeometri] = useState('')
    const [fileUpload, setFileUpload] = useState<File | null>(null)

    useEffect(() => {
        if (!navbarRef.current) return;

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setNavbarHeight(entry.contentRect.height);
            }
        });

        observer.observe(navbarRef.current);
        return () => observer.disconnect();
    }, []);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentStep(2)
    }

    const handleBack = () => {
        setCurrentStep(1)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log({
            namaKegiatan,
            tanggalMulai,
            tanggalHingga,
            jenisPerolehan,
            jenisGeometri,
            fileUpload
        })
        // TODO: Implement final submit logic
    }

    const steps = [
        { number: 1, label: 'Data Transaksi' },
        { number: 2, label: 'Upload Data' }
    ]

    return (
        <SurveyorLayout>
            <div
                className="flex flex-col grow overflow-hidden px-8 md:px-20"
                style={{ paddingTop: fullTab ? navbarHeight + 27 : 90 }}
            >
                <h1 className="text-2xl font-bold mb-2">Penyampaian Data</h1>
                <p className="text-muted-foreground mb-6">Tambah Transaksi Penyampaian Data</p>

                {/* Step Indicator */}
                {/* <div className="flex items-center gap-4 mb-8">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold 
                                    ${currentStep > step.number ? 'bg-blue-500 text-white' :
                                        currentStep === step.number ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step.number}
                                </div>
                                <span className={`text-sm ${currentStep >= step.number ? 'font-semibold' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 max-w-24 ${currentStep > step.number ? 'bg-blue-500' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div> */}

                <div className="bg-white rounded-lg border p-6">
                    {currentStep === 1 && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Form Pengisian Transaksi Penyampaian Data</h2>

                            <form onSubmit={handleNext} className="space-y-6">
                                <div className="space-y-2 w-1/3">
                                    <Label htmlFor="namaKegiatan">Nama Kegiatan (Sumber)</Label>
                                    <Input
                                        id="namaKegiatan"
                                        placeholder="Sumber data"
                                        value={namaKegiatan}
                                        onChange={(e) => setNamaKegiatan(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Waktu Akuisisi</Label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex w-1/6 gap-1">
                                            <Label htmlFor="tanggalMulai" className="text-sm text-muted-foreground w-fit">Mulai dari</Label>
                                            <Input
                                                id="tanggalMulai"
                                                type="date"
                                                value={tanggalMulai}
                                                onChange={(e) => setTanggalMulai(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex w-1/6 gap-1">
                                            <Label htmlFor="tanggalHingga" className="text-sm text-muted-foreground">Hingga</Label>
                                            <Input
                                                id="tanggalHingga"
                                                type="date"
                                                value={tanggalHingga}
                                                onChange={(e) => setTanggalHingga(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 w-1/6">
                                    <Label htmlFor="jenisPerolehan">Jenis Perolehan Data</Label>
                                    <Select value={jenisPerolehan} onValueChange={setJenisPerolehan}>
                                        <SelectTrigger className={!jenisPerolehan ? 'border-red-300' : ''}>
                                            <SelectValue placeholder="Pilih jenis perolehan data" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="survey">Partisipatif</SelectItem>
                                                <SelectItem value="digitasi">Urun Daya</SelectItem>
                                                <SelectItem value="integrasi">Data Sekunder</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                    <Button type="submit" className="bg-green-500 hover:bg-green-600">
                                        Lanjut
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Upload Data</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2 w-1/2">
                                    <Label htmlFor="jenisGeometri">Jenis Geometri SHP</Label>
                                    <Select value={jenisGeometri} onValueChange={setJenisGeometri}>
                                        <SelectTrigger className={!jenisGeometri ? 'border-red-300' : ''}>
                                            <SelectValue placeholder="Pilih jenis geometri SHP" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="lengkap">SHP Titik</SelectItem>
                                                <SelectItem value="sebagian">SHP Garis</SelectItem>
                                                <SelectItem value="revisi">SHP Area</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 w-1/2">
                                    <Label htmlFor="fileUpload">Unggah SHP</Label>
                                    <Input
                                        id="fileUpload"
                                        type="file"
                                        accept=".zip,.rar"
                                        onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">Pilih berkas: (.zip/ .rar)</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={handleBack}>
                                        Kembali
                                    </Button>
                                    <Button type="submit" className="bg-green-500 hover:bg-green-600">
                                        Unggah
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </SurveyorLayout>
    )
}

export default TambahTransaksiPage
