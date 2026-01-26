"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BigLayout from "@/layouts/BigLayout"
import { useApiHandler } from "@/utils/apiHandler"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useMemo, useState } from 'react'
import { API_URL } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"
import { MultiSelect, Option } from "@/components/MultiSelect"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Type untuk Announcement dari API
type Announcement = {
    id: number
    code: string
    amount: number
    start: string
    end: string
    created_at: string
    updated_at: string
}

interface Gazetteer {
    id: string
    title: string
    edition: string
    published_at: string | null
}

interface CandidateItem {
    id: string
    name: string
    count: number
}

interface CandidatesData {
    total: number
    by_provinces: { province_id: string, name: string, count: number }[]
    by_regencies: { regency_id: string, name: string, count: number, province_id: string }[]
    by_elements: { element_id: string, name: string, count: number }[]
}

const TambahPengumumanPage: React.FC = () => {
    const router = useRouter()
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    const apiHandler = useApiHandler({ setLoading, shouldHandleError: false })

    // Data for dropdowns
    const [gazetteers, setGazetteers] = useState<Gazetteer[]>([])
    const [candidates, setCandidates] = useState<CandidatesData | null>(null)

    // Form states
    const [selectedGazetteer, setSelectedGazetteer] = useState('')
    const [selectedProvinces, setSelectedProvinces] = useState<Option[]>([])
    const [selectedRegencies, setSelectedRegencies] = useState<Option[]>([])
    const [selectedElements, setSelectedElements] = useState<Option[]>([])

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true)
            try {
                // Fetch Gazetteers
                const gazRes = await fetch(`${API_URL}/big/gazetteer`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const gazData = await gazRes.json()
                if (!gazData.error) {
                    // Hanya ambil yang published_at nya bernilai null
                    const unpublishedGazetteers = gazData.data.filter((g: Gazetteer) => g.published_at === null)
                    setGazetteers(unpublishedGazetteers)
                }

                // Fetch Candidates
                const candRes = await fetch(`${API_URL}/big/announcement/candidates`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const candData = await candRes.json()
                if (!candData.error) setCandidates(candData.data)
            } catch (err) {
                console.error("Failed to fetch form data:", err)
            } finally {
                setFetching(false)
            }
        }
        fetchData()
    }, [token])

    const provinceOptions = useMemo(() =>
        candidates?.by_provinces.map(p => ({ label: p.name, value: p.province_id })) || []
        , [candidates])

    const regencyOptions = useMemo(() => {
        if (!candidates) return []
        const selectedProvIds = selectedProvinces.map(p => p.value)
        return candidates.by_regencies
            .filter(r => selectedProvIds.length === 0 || selectedProvIds.includes(r.province_id))
            .map(r => ({ label: r.name, value: r.regency_id }))
    }, [candidates, selectedProvinces])

    const elementOptions = useMemo(() =>
        candidates?.by_elements.map(e => ({ label: e.name, value: e.element_id })) || []
        , [candidates])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedGazetteer) {
            alert("Harap pilih Gazetteer")
            return
        }

        apiHandler('POST', '/big/announcement', {
            gazetteer_id: selectedGazetteer,
            provinces: selectedProvinces.map(p => p.value),
            regencies: selectedRegencies.map(r => r.value),
            elements: selectedElements.map(e => e.value)
        }).then((res: any) => {
            // Double check if there's an error field because of how apiHandler might be implemented
            if (res && res.error) {
                throw res
            }
            alert("Berhasil menambahkan pengumuman")
            router.push('/big?tab=pengumuman')
        }).catch((err) => {
            console.error('Submit error:', err)
            // Error response could be the raw error object or have a message field
            const errorMessage = err.message || (typeof err === 'string' ? err : 'Terjadi kesalahan saat menyimpan data')
            alert(errorMessage)
        })
    }

    const getChartData = (type: 'elements' | 'provinces' | 'regencies') => {
        let labels: string[] = []
        let data: number[] = []
        let label = ''

        if (type === 'elements') {
            labels = candidates?.by_elements.map(item => item.name) || []
            data = candidates?.by_elements.map(item => item.count) || []
            label = 'Jumlah Data per Jenis Unsur'
        } else if (type === 'provinces') {
            labels = candidates?.by_provinces.map(item => item.name) || []
            data = candidates?.by_provinces.map(item => item.count) || []
            label = 'Jumlah Data per Provinsi'
        } else if (type === 'regencies') {
            labels = candidates?.by_regencies.map(item => item.name) || []
            data = candidates?.by_regencies.map(item => item.count) || []
            label = 'Jumlah Data per Kabupaten/Kota'
        }

        return {
            labels,
            datasets: [
                {
                    label,
                    data,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                },
            ],
        }
    }

    const getChartOptions = (title: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 14,
                    weight: 'bold' as const,
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    })

    return (
        <BigLayout>
            <div className="p-6 pt-24 min-h-[calc(100vh-60px)]">
                <div className="flex flex-col">
                    <Button
                        variant="ghost"
                        className="self-start mb-4 gap-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={18} />
                        Kembali ke Daftar
                    </Button>

                    <p className="text-muted-foreground mb-2">Pengumuman</p>
                    <h1 className="text-2xl font-bold mb-6">Tambah Pengumuman</h1>

                    <Card>
                        <CardContent className="p-8 space-y-10">
                            {/* Ringkasan Statistik Section */}
                            <section className="w-full">
                                <h2 className="text-xl font-semibold mb-6">Ringkasan Statistik</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Elements Chart */}
                                    <div className="h-[300px] w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        {fetching ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : candidates && candidates.by_elements.length > 0 ? (
                                            <Bar data={getChartData('elements')} options={getChartOptions('Jenis Unsur')} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                                Tidak ada data Unsur
                                            </div>
                                        )}
                                    </div>

                                    {/* Provinces Chart */}
                                    <div className="h-[300px] w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        {fetching ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : candidates && candidates.by_provinces.length > 0 ? (
                                            <Bar data={getChartData('provinces')} options={getChartOptions('Provinsi')} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                                Tidak ada data Provinsi
                                            </div>
                                        )}
                                    </div>

                                    {/* Regencies Chart */}
                                    <div className="h-[300px] w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        {fetching ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : candidates && candidates.by_regencies.length > 0 ? (
                                            <Bar data={getChartData('regencies')} options={getChartOptions('Kabupaten/Kota')} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                                Tidak ada data Kabupaten/Kota
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Form Section */}
                            <section>
                                <h2 className="text-xl font-semibold mb-8">Form Tambah Pengumuman</h2>

                                <form className="space-y-8" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="gazetteer" className="text-sm font-medium">Gazetteer</Label>
                                                <Select value={selectedGazetteer} onValueChange={setSelectedGazetteer} required>
                                                    <SelectTrigger id="gazetteer" className="h-11">
                                                        <SelectValue placeholder="Pilih Gazetteer" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {gazetteers.map((g) => (
                                                            <SelectItem key={g.id} value={g.id}>
                                                                {g.title} ({g.edition})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="province" className="text-sm font-medium">Provinsi</Label>
                                                <MultiSelect
                                                    options={provinceOptions}
                                                    selected={selectedProvinces}
                                                    onChange={setSelectedProvinces}
                                                    placeholder="Pilih Provinsi"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="regency" className="text-sm font-medium">Kabupaten/Kota</Label>
                                                <MultiSelect
                                                    options={regencyOptions}
                                                    selected={selectedRegencies}
                                                    onChange={setSelectedRegencies}
                                                    placeholder="Pilih Kabupaten/Kota"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="element" className="text-sm font-medium">Unsur</Label>
                                                <MultiSelect
                                                    options={elementOptions}
                                                    selected={selectedElements}
                                                    onChange={setSelectedElements}
                                                    placeholder="Pilih Unsur"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <Button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 h-11 px-8 rounded-md transition-colors"
                                            disabled={loading}
                                        >
                                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Pengumuman"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.back()}
                                            disabled={loading}
                                            className="h-11 px-8 rounded-md"
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </form>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BigLayout>
    )
}

export default TambahPengumumanPage
