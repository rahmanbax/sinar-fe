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
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Type for statistics data from API
interface StatisticsData {
    count: number
    element_code: string
    element_name: string
}

// Province type from API
interface Province {
    id: number
    name: string
    code: string
    level: string
}

// Element type from API
interface Element {
    code: string
    name: string
    subcategory_id: string
    type: string | null
    created_at: string
    updated_at: string | null
    deleted_at: string | null
}

const Page = () => {
    const router = useRouter()

    const [title, setTitle] = useState('')
    // const [tanggalAwal, setTanggalAwal] = useState('') // Not needed for API
    const [tanggalAkhir, setTanggalAkhir] = useState('')
    const [jenisUnsur, setJenisUnsur] = useState<string[]>([]) // Array for multi-select
    const [wilayahAdministrasi, setWilayahAdministrasi] = useState('')
    const [verifikator, setVerifikator] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Statistics data from API
    const [statisticsData, setStatisticsData] = useState<StatisticsData[]>([])
    const [loadingStatistics, setLoadingStatistics] = useState(true)

    // Province data from API
    const [provinces, setProvinces] = useState<Province[]>([])
    const [loadingProvinces, setLoadingProvinces] = useState(true)
    const [openProvinceCombobox, setOpenProvinceCombobox] = useState(false)

    // Element data from API
    const [elements, setElements] = useState<Element[]>([])
    const [loadingElements, setLoadingElements] = useState(true)
    const [openElementPopover, setOpenElementPopover] = useState(false)

    // Fetch data on mount
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/verifications/transaction/candidates`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result = await res.json()
                if (!result.error && result.data) {
                    setStatisticsData(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch statistics:', err)
            } finally {
                setLoadingStatistics(false)
            }
        }
        fetchStatistics()

        // const fetchProvinces = async () => {
        //     try {
        //         const res = await fetch(`${API_URL}/regions?level=PROVINCE&limit=50`)
        //         const result = await res.json()
        //         if (!result.error && result.data) {
        //             setProvinces(result.data)
        //         }
        //     } catch (err) {
        //         console.error('Failed to fetch provinces:', err)
        //     } finally {
        //         setLoadingProvinces(false)
        //     }
        // }
        // fetchProvinces()

        const fetchElements = async () => {
            try {
                const res = await fetch(`${API_URL}/classification/elements`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setElements(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch elements:', err)
            } finally {
                setLoadingElements(false)
            }
        }
        fetchElements()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsSubmitting(true)

        try {
            // Format due_at to match required format: "2026-01-01 07:00:00.000 +0700"
            const dueDate = new Date(tanggalAkhir)
            const due_at = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')} 07:00:00.000 +0700`

            const requestBody = {
                title: title,
                elements: jenisUnsur, // Array of selected element codes
                due_at: due_at
            }

            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/verifications/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            })

            const result = await response.json()

            if (!response.ok || result.error) {
                throw new Error(result.message || 'Gagal membuat penelaahan')
            }

            alert('Penelaahan berhasil dibuat!')

            // Redirect to penelaahan list page
            router.push('/penelaahan')

        } catch (error) {
            console.error('Submit error:', error)
            alert(error instanceof Error ? error.message : 'Gagal membuat penelaahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Transform API data for chart
    const chartData = {
        labels: statisticsData.map(item => item.element_name),
        datasets: [
            {
                label: 'Jumlah Data per Jenis Unsur',
                data: statisticsData.map(item => item.count),
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
                text: 'Jumlah Data per Jenis Unsur',
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
            <div className="pt-20 p-6 mt-6 h-screen">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/penelaahan">
                        <Button size='icon-sm' variant="ghost">
                            <ChevronLeft />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Buat Penelaahan</h1>
                </div>

                <Card className="max-w-1/3">
                    {/* <CardHeader>
                        <CardTitle>Form Penelaahan Baru</CardTitle>
                    </CardHeader> */}
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit}>
                            {/* Ringkasan Statistik Chart */}
                            <div className="space-y-3 mb-6">
                                <Label>Ringkasan Statistik - Jenis Unsur</Label>
                                <div className="h-[200px] w-full bg-gray-50 rounded-lg p-3">
                                    {loadingStatistics ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                        </div>
                                    ) : statisticsData.length > 0 ? (
                                        <Bar data={chartData} options={chartOptions} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            Tidak ada data
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Buat Penelaahan Section */}
                            <h2 className="font-semibold mb-6">Buat Penelaahan</h2>

                            {/* Title */}
                            <div className="space-y-2 mb-6">
                                <Label htmlFor="title">
                                    Judul Penelaahan <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Masukkan judul penelaahan"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Tanggal Akhir */}
                            <div className="space-y-2 mb-6">
                                <Label htmlFor="tanggal-akhir">
                                    Tanggal Akhir <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tanggal-akhir"
                                    type="date"
                                    value={tanggalAkhir}
                                    onChange={(e) => setTanggalAkhir(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Tanggal Awal - Not needed for API */}
                            {/* <div className="grid grid-cols-2 gap-4">
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
                        </div> */}

                            {/* Jenis Unsur */}
                            <div className="space-y-2 mb-6">
                                <Label>
                                    Jenis Unsur <span className="text-red-500">*</span>
                                </Label>
                                <input type="hidden" required={jenisUnsur.length === 0} />
                                <Popover open={openElementPopover} onOpenChange={setOpenElementPopover}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openElementPopover}
                                            className="w-full justify-between font-normal"
                                            disabled={loadingElements}
                                        >
                                            {loadingElements ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Memuat...</span>
                                                </div>
                                            ) : jenisUnsur.length > 0 ? (
                                                <span>{jenisUnsur.length} unsur dipilih</span>
                                            ) : (
                                                <span className="text-muted-foreground">Pilih Jenis Unsur</span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Cari jenis unsur..." />
                                            <CommandList>
                                                <CommandEmpty>Jenis unsur tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {elements
                                                        .sort((a, b) => {
                                                            const aSelected = jenisUnsur.includes(a.code)
                                                            const bSelected = jenisUnsur.includes(b.code)
                                                            // Selected items first
                                                            if (aSelected && !bSelected) return -1
                                                            if (!aSelected && bSelected) return 1
                                                            return 0
                                                        })
                                                        .map((element) => {
                                                            const isSelected = jenisUnsur.includes(element.code)
                                                            return (
                                                                <CommandItem
                                                                    key={element.code}
                                                                    value={element.name}
                                                                    onSelect={() => {
                                                                        if (isSelected) {
                                                                            setJenisUnsur(jenisUnsur.filter(code => code !== element.code))
                                                                        } else {
                                                                            setJenisUnsur([...jenisUnsur, element.code])
                                                                        }
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        className="mr-2"
                                                                    />
                                                                    {element.name}
                                                                </CommandItem>
                                                            )
                                                        })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Wilayah Administrasi */}
                            {/* <div className="space-y-2">
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
                        </div> */}

                            {/* Verifikator */}
                            {/* <div className="space-y-2">
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
                        </div> */}

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Link href="/penelaahan" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                                        Batal
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={isSubmitting || jenisUnsur.length === 0}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Buat Penelaahan'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ReviewerLayout>
    )
}

export default Page
