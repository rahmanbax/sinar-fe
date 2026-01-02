"use client"

import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useApiHandler, useApiHandlerWithPagination } from "@/utils/apiHandler"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersVertical, ArrowLeft } from "lucide-react"
import React, { useCallback, useEffect, useState } from 'react'
import dayjs from "dayjs"
import { Label } from "@radix-ui/react-label"

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

// Sub-komponen: Form Tambah Pengumuman
interface TambahPengumumanFormProps {
    onBack: () => void
}

const TambahPengumumanForm: React.FC<TambahPengumumanFormProps> = ({ onBack }) => {
    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandler<Announcement>({ setLoading, shouldHandleError: true })

    const [code, setCode] = useState('')
    const [amount, setAmount] = useState('')
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        apiHandler('POST', '/announcements', {
            code,
            amount: parseInt(amount),
            start,
            end
        }).then(() => {
            onBack()
        })
    }

    return (
        <div className="flex flex-col">
            <Button
                variant="ghost"
                className="self-start mb-4 gap-2"
                onClick={onBack}
            >
                <ArrowLeft size={18} />
                Kembali ke Daftar
            </Button>

            <p className="text-muted-foreground mb-2">Pengumuman</p>
            <h1 className="text-2xl font-bold mb-6">Tambah Pengumuman</h1>

            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-6">Form Tambah Pengumuman</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="kodePengumuman">Kode Pengumuman</Label>
                        <Input
                            id="kodePengumuman"
                            placeholder="Contoh: PGM-001/2025"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="jumlahData">Jumlah Data</Label>
                        <Input
                            id="jumlahData"
                            type="number"
                            placeholder="Jumlah data"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="tanggalMulai" className="text-sm text-muted-foreground w-fit">Tanggal Mulai</Label>
                        <Input
                            id="tanggalMulai"
                            type="date"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="tanggalSelesai" className="text-sm text-muted-foreground w-fit">Tanggal Selesai</Label>
                        <Input
                            id="tanggalSelesai"
                            type="date"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Sub-komponen: Daftar Pengumuman
interface DaftarPengumumanProps {
    onAddClick: () => void
}

const DaftarPengumuman: React.FC<DaftarPengumumanProps> = ({ onAddClick }) => {
    const columnsPengumuman: ColumnConfig = {
        code: { label: 'Kode Pengumuman' },
        amount: { label: 'Jumlah Data' },
        start: { label: 'Mulai Pengumuman', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
        end: { label: 'Selesai Pengumuman', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    }

    const options: Option[] = Object.keys(columnsPengumuman).map((c) => ({
        value: c,
        label: columnsPengumuman[c].label
    }))

    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandlerWithPagination<Announcement>({ setLoading, shouldHandleError: true })
    const [data, setData] = useState<Announcement[]>([])
    const [searchString, setSearchString] = useState<string>()
    const [limit, setLimit] = useState(5)
    const [showCols, setShowCols] = useState<{ label: string, value: string }[]>(options)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    const onPageChange = (num: number) => {
        setPage(num)
    }

    const refresh = useCallback(() => {
        apiHandler('GET', `/announcements?page=${page}&per_page=${limit}`)
            .then(r => {
                if (!r?.data || !Array.isArray(r.data)) return
                setData(r.data)
                if (r.pagination) {
                    setTotalPages(r.pagination.last_page)
                }
            })
    }, [apiHandler, page, limit])

    useEffect(refresh, [refresh])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Button size='sm' className="bg-green-500 hover:bg-green-700" onClick={onAddClick}>
                    <div className="flex items-center gap-2">
                        <Plus className="text-white" />
                        Tambah Pengumuman
                    </div>
                </Button>
            </div>
            <Card>
                <CardContent className="px-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between mb-5 gap-y-3">
                        <div className="flex gap-2">
                            <InputGroup className='hidden sm:flex bg-neutral-50'>
                                <InputGroupInput placeholder="Cari..." onChange={(e) => setSearchString(e.target.value)} />
                                <InputGroupAddon>
                                    <Search />
                                </InputGroupAddon>
                            </InputGroup>
                            <Button variant='outline' size='icon-lg'><SlidersVertical /></Button>
                            <Button variant='ghost' className="shadow-md"><Download />Unduh</Button>
                        </div>
                        <InputGroup className='flex sm:hidden bg-neutral-50'>
                            <InputGroupInput placeholder="Cari..." onChange={(e) => setSearchString(e.target.value)} />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                        <div className="hidden sm:flex gap-2 items-center justify-center lg:justify-end w-full lg:w-2/3">
                            <h5 className="font-semibold">Tampilkan</h5>
                            <MultiSelect
                                options={options}
                                selected={showCols}
                                onChange={setShowCols}
                                className="w-1/4"
                            />
                            <div className="block mb-2 sm:mb-0 w-36">
                                <Select onValueChange={(v) => setLimit(parseInt(v))} value={limit.toString()}>
                                    <SelectTrigger className="w-full rounded-md p-1 pl-3 text-start">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="5">5 Baris</SelectItem>
                                            <SelectItem value="10">10 Baris</SelectItem>
                                            <SelectItem value="20">20 Baris</SelectItem>
                                            <SelectItem value="100">100 Baris</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-center gap-1 p-1">
                                <Button
                                    size="icon-sm"
                                    disabled={page === 1}
                                    variant='ghost'
                                    onClick={() => onPageChange(page - 1)}
                                >
                                    <ChevronLeft />
                                </Button>
                                {pages.map((p) => (
                                    <Button
                                        key={p}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onPageChange(p)}
                                        className={cn(
                                            "text-sm transition-all",
                                            page === p
                                                ? "font-bold text-black"
                                                : "font-normal text-muted-foreground"
                                        )}
                                    >
                                        {p}
                                    </Button>
                                ))}
                                <Button
                                    size="icon-sm"
                                    disabled={page === totalPages}
                                    variant='ghost'
                                    onClick={() => onPageChange(page + 1)}
                                >
                                    <ChevronRight />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <SinarParameterizedTable
                        data={data}
                        columns={columnsPengumuman}
                        showCols={showCols}
                        loading={loading}
                        actHandler={(item) => console.log('Aksi:', item)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

// Komponen utama PengumumanTab
const PengumumanTab: React.FC = () => {
    const [view, setView] = useState<'list' | 'add'>('list')

    return (
        <div>
            {view === 'list' ? (
                <DaftarPengumuman onAddClick={() => setView('add')} />
            ) : (
                <TambahPengumumanForm onBack={() => setView('list')} />
            )}
        </div>
    )
}

export default PengumumanTab
