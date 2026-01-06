"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronLeft, ChevronsUpDown, Loader2 } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { API_URL } from "@/lib/config"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Sample data for different chart types
const chartDataSets = {
    'jenis-unsur': {
        labels: ['Pelabuhan Laut', 'Pelabuhan Penyeberangan', 'Terminal Bus', 'Bandara', 'Stasiun KA', 'Pelabuhan Sungai'],
        data: [45, 28, 62, 15, 38, 22],
        label: 'Jumlah Data per Jenis Unsur'
    },
    'wilayah': {
        labels: ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DKI Jakarta', 'Banten', 'Bali'],
        data: [85, 72, 95, 45, 38, 28],
        label: 'Jumlah Data per Wilayah'
    },
    'status': {
        labels: ['Belum Verifikasi', 'Dalam Proses', 'Selesai', 'Ditolak', 'Pending Review'],
        data: [120, 45, 280, 15, 32],
        label: 'Jumlah Data per Status'
    },
    'bulan': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
        data: [32, 45, 28, 52, 68, 42],
        label: 'Jumlah Data per Bulan'
    }
}

// Province type from API
interface Province {
    id: number
    name: string
    code: string
    level: string
}

// Category type from API
interface Category {
    id: number
    code: string
    name: string
}

const Page = () => {
    const [tanggalAwal, setTanggalAwal] = useState('')
    const [tanggalAkhir, setTanggalAkhir] = useState('')
    const [jenisUnsur, setJenisUnsur] = useState('')
    const [wilayahAdministrasi, setWilayahAdministrasi] = useState('')
    const [verifikator, setVerifikator] = useState('')
    const [chartType, setChartType] = useState<keyof typeof chartDataSets>('jenis-unsur')

    // Province data from API
    const [provinces, setProvinces] = useState<Province[]>([])
    const [loadingProvinces, setLoadingProvinces] = useState(true)
    const [openProvinceCombobox, setOpenProvinceCombobox] = useState(false)

    // Category data from API
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch(`${API_URL}/regions?level=PROVINCE&limit=50`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setProvinces(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch provinces:', err)
            } finally {
                setLoadingProvinces(false)
            }
        }
        fetchProvinces()

        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/classification/categories?sort_by=name&sort_order=asc`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setCategories(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err)
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    const handleSubmit = () => {
        // TODO: Submit form
        console.log({
            tanggalAwal,
            tanggalAkhir,
            jenisUnsur,
            wilayahAdministrasi,
            verifikator
        })
    }

    const currentData = chartDataSets[chartType]
    const chartData = {
        labels: currentData.labels,
        datasets: [
            {
                label: currentData.label,
                data: currentData.data,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: currentData.label,
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
    }

    return (
        <ReviewerLayout>
            <div className="pt-20 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/penelaahan">
                        <Button size='icon-sm' variant="ghost">
                            <ChevronLeft />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Buat Penelaahan</h1>
                </div>

                <Card className="max-w-2xl">
                    {/* <CardHeader>
                        <CardTitle>Form Penelaahan Baru</CardTitle>
                    </CardHeader> */}
                    <CardContent className="space-y-6">
                        {/* Ringkasan Statistik Chart */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Ringkasan Statistik</Label>
                                <Select value={chartType} onValueChange={(v) => setChartType(v as keyof typeof chartDataSets)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Pilih Data" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jenis-unsur">Jenis Unsur</SelectItem>
                                        <SelectItem value="wilayah">Wilayah Administrasi</SelectItem>
                                        <SelectItem value="status">Status Verifikasi</SelectItem>
                                        <SelectItem value="bulan">Per Bulan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="h-[200px] w-full bg-gray-50 rounded-lg p-3">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Tanggal Awal & Akhir */}
                        <h2 className="font-semibold">Buat Penelaahan</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tanggal-awal">Tanggal Awal</Label>
                                <Input
                                    id="tanggal-awal"
                                    type="date"
                                    value={tanggalAwal}
                                    onChange={(e) => setTanggalAwal(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tanggal-akhir">Tanggal Akhir</Label>
                                <Input
                                    id="tanggal-akhir"
                                    type="date"
                                    value={tanggalAkhir}
                                    onChange={(e) => setTanggalAkhir(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Jenis Unsur */}
                        <div className="space-y-2">
                            <Label>Jenis Unsur</Label>
                            <Select value={jenisUnsur} onValueChange={setJenisUnsur} disabled={loadingCategories}>
                                <SelectTrigger>
                                    {loadingCategories ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Memuat...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="Pilih Jenis Unsur" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.code}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Wilayah Administrasi */}
                        <div className="space-y-2">
                            <Label>Wilayah Administrasi</Label>
                            <Popover open={openProvinceCombobox} onOpenChange={setOpenProvinceCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openProvinceCombobox}
                                        className="w-full justify-between font-normal"
                                        disabled={loadingProvinces}
                                    >
                                        {loadingProvinces ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Memuat...</span>
                                            </div>
                                        ) : wilayahAdministrasi ? (
                                            provinces.find((p) => p.code === wilayahAdministrasi)?.name
                                        ) : (
                                            "Pilih Wilayah Administrasi"
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Cari provinsi..." />
                                        <CommandList>
                                            <CommandEmpty>Provinsi tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {provinces.map((province) => (
                                                    <CommandItem
                                                        key={province.id}
                                                        value={province.name}
                                                        onSelect={() => {
                                                            setWilayahAdministrasi(province.code)
                                                            setOpenProvinceCombobox(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                wilayahAdministrasi === province.code ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {province.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Verifikator */}
                        <div className="space-y-2">
                            <Label>Verifikator</Label>
                            <Select value={verifikator} onValueChange={setVerifikator}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Verifikator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tim-1">Tim Verifikator 1</SelectItem>
                                    <SelectItem value="tim-2">Tim Verifikator 2</SelectItem>
                                    <SelectItem value="tim-3">Tim Verifikator 3</SelectItem>
                                    <SelectItem value="tim-4">Tim Verifikator 4</SelectItem>
                                    <SelectItem value="tim-5">Tim Verifikator 5</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Link href="/penelaahan" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={handleSubmit}
                            >
                                Buat Transaksi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ReviewerLayout>
    )
}

export default Page
