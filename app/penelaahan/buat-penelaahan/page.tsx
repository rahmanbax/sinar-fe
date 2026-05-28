"use client"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronsUpDown, Loader2 } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useAuth } from "@/contexts/AuthContext"
import {
    createVerificationTransaction,
    getVerificationCandidates,
    getAvailableParticipants,
} from "@/api/verification"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface StatisticsData {
    count: number
    element_code: string
    element_name: string
    category_code: string
    category_name: string
    subcategory_code: string
    subcategory_name: string
}

interface Participant {
    id: number
    name: string
    email: string
    verification_permission_level: number
}

const Page = () => {
    const router = useRouter()

    const [title, setTitle] = useState('')
    const [tanggalAkhir, setTanggalAkhir] = useState('')
    const [jenisUnsur, setJenisUnsur] = useState<string[]>([])
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { token } = useAuth()

    const [statisticsData, setStatisticsData] = useState<StatisticsData[]>([])
    const [loadingStatistics, setLoadingStatistics] = useState(true)

    const [participants, setParticipants] = useState<Participant[]>([])
    const [loadingParticipants, setLoadingParticipants] = useState(true)

    const [openElementPopover, setOpenElementPopover] = useState(false)
    const [openParticipantPopover, setOpenParticipantPopover] = useState(false)

    useEffect(() => {
        const fetchAll = async () => {
            const [statsRes, participantsRes] = await Promise.all([
                getVerificationCandidates(token),
                getAvailableParticipants(token),
            ])
            if (!statsRes.error && statsRes.data) setStatisticsData(statsRes.data)
            if (!participantsRes.error && participantsRes.data) setParticipants(participantsRes.data)
            setLoadingStatistics(false)
            setLoadingParticipants(false)
        }
        fetchAll()
    }, [token])

    // Group elements by category
    const elementsByCategory = useMemo(() => {
        const map = new Map<string, { categoryName: string; items: StatisticsData[] }>()
        for (const item of statisticsData) {
            if (!map.has(item.category_code)) {
                map.set(item.category_code, { categoryName: item.category_name, items: [] })
            }
            map.get(item.category_code)!.items.push(item)
        }
        return map
    }, [statisticsData])

    const toggleElement = (code: string) => {
        setJenisUnsur(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        )
    }

    const toggleAllInCategory = (codes: string[]) => {
        const allSelected = codes.every(c => jenisUnsur.includes(c))
        if (allSelected) {
            setJenisUnsur(prev => prev.filter(c => !codes.includes(c)))
        } else {
            setJenisUnsur(prev => [...new Set([...prev, ...codes])])
        }
    }

    const selectAllElements = () => {
        const all = statisticsData.map(i => i.element_code)
        setJenisUnsur(prev => prev.length === all.length ? [] : all)
    }

    const toggleParticipant = (id: number) => {
        setSelectedParticipants(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const dueDate = new Date(tanggalAkhir)
            const due_at = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')} 07:00:00.000 +0700`
            const today = new Date()
            const issued_at = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 07:00:00.000 +0700`

            const result = await createVerificationTransaction(token, {
                title,
                elements: jenisUnsur,
                issued_at,
                due_at,
                participants: selectedParticipants.length > 0 ? selectedParticipants : undefined,
            })

            if (result.error) throw new Error(result.message || 'Gagal membuat penelaahan')
            alert('Penelaahan berhasil dibuat!')
            router.push('/penelaahan?tab=review-data')
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Gagal membuat penelaahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const chartData = {
        labels: statisticsData.map(item => item.element_name),
        datasets: [{
            label: 'Jumlah Data',
            data: statisticsData.map(item => item.count),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
        }],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Jumlah Data per Jenis Unsur',
                font: { size: 14, weight: 'bold' as const },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0, stepSize: 1 },
            },
        },
    }

    const allSelected = statisticsData.length > 0 && jenisUnsur.length === statisticsData.length

    return (
        <ReviewerLayout>
            <div className="pt-20 p-6 mt-6 h-screen">
                <div onClick={() => router.back()} className="flex items-center gap-3 mb-5 hover:opacity-70 transition-opacity cursor-pointer">
                    <Button size="icon-sm"><ChevronLeft /></Button>
                    <span className="font-medium">Kembali</span>
                </div>

                <Card className="max-w-1/3">
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit}>
                            {/* Chart */}
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
                                            Tidak ada data kandidat
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2 className="font-semibold mb-6">Buat Penelaahan</h2>

                            {/* Judul */}
                            <div className="space-y-2 mb-6">
                                <Label htmlFor="title">Judul Penelaahan <span className="text-red-500">*</span></Label>
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
                                <Label htmlFor="tanggal-akhir">Tanggal Akhir <span className="text-red-500">*</span></Label>
                                <Input
                                    id="tanggal-akhir"
                                    type="date"
                                    value={tanggalAkhir}
                                    onChange={(e) => setTanggalAkhir(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Jenis Unsur - grouped by category */}
                            <div className="space-y-2 mb-6">
                                <Label>Jenis Unsur <span className="text-red-500">*</span></Label>
                                <input type="hidden" required={jenisUnsur.length === 0} />
                                <Popover open={openElementPopover} onOpenChange={setOpenElementPopover}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between font-normal"
                                            disabled={loadingStatistics}
                                        >
                                            {loadingStatistics ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Memuat...</span>
                                                </div>
                                            ) : jenisUnsur.length > 0 ? (
                                                <span>{jenisUnsur.length} jenis unsur dipilih</span>
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

                                                {/* Select All */}
                                                <CommandGroup>
                                                    <CommandItem
                                                        onSelect={selectAllElements}
                                                        className="font-medium text-blue-600"
                                                    >
                                                        <Checkbox
                                                            checked={allSelected}
                                                            className="mr-2"
                                                        />
                                                        Pilih Semua
                                                    </CommandItem>
                                                </CommandGroup>

                                                {/* Grouped by category */}
                                                {Array.from(elementsByCategory.entries()).map(([catCode, { categoryName, items }]) => {
                                                    const allCatSelected = items.every(i => jenisUnsur.includes(i.element_code))
                                                    const catCodes = items.map(i => i.element_code)
                                                    return (
                                                        <CommandGroup key={catCode} heading={categoryName}>
                                                            {/* Select all in category */}
                                                            <CommandItem
                                                                onSelect={() => toggleAllInCategory(catCodes)}
                                                                className="text-xs text-muted-foreground italic"
                                                            >
                                                                <Checkbox
                                                                    checked={allCatSelected}
                                                                    className="mr-2 h-3 w-3"
                                                                />
                                                                Pilih semua {categoryName}
                                                            </CommandItem>
                                                            {items.map((item) => (
                                                                <CommandItem
                                                                    key={item.element_code}
                                                                    value={`${item.category_name} ${item.element_name}`}
                                                                    onSelect={() => toggleElement(item.element_code)}
                                                                >
                                                                    <Checkbox
                                                                        checked={jenisUnsur.includes(item.element_code)}
                                                                        className="mr-2"
                                                                    />
                                                                    <span>{item.element_name}</span>
                                                                    <span className="ml-auto text-xs text-muted-foreground">{item.count}</span>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    )
                                                })}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Participants */}
                            <div className="space-y-2 mb-6">
                                <Label>Anggota Tim Penelaahan</Label>
                                <Popover open={openParticipantPopover} onOpenChange={setOpenParticipantPopover}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between font-normal"
                                            disabled={loadingParticipants}
                                        >
                                            {loadingParticipants ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Memuat...</span>
                                                </div>
                                            ) : selectedParticipants.length > 0 ? (
                                                <span>{selectedParticipants.length} anggota dipilih</span>
                                            ) : (
                                                <span className="text-muted-foreground">Tambah anggota (opsional)</span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Cari anggota..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {participants.length === 0
                                                        ? "Tidak ada verificator lain di wilayah ini."
                                                        : "Anggota tidak ditemukan."}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {participants.map((p) => (
                                                        <CommandItem
                                                            key={p.id}
                                                            value={p.name}
                                                            onSelect={() => toggleParticipant(p.id)}
                                                        >
                                                            <Checkbox
                                                                checked={selectedParticipants.includes(p.id)}
                                                                className="mr-2"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{p.name}</span>
                                                                <span className="text-xs text-muted-foreground">{p.email}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Submit */}
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
                                    ) : 'Buat Penelaahan'}
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
