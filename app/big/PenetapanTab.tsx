"use client"

import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersVertical, ArrowLeft } from "lucide-react"
import React, { useState } from 'react'
import dayjs from "dayjs"
import { Label } from "@radix-ui/react-label"

const data = [
    { id: 1, no_sk: 'SK-001/2025', jumlah_data: 150, tanggal_penetapan: new Date('2025-01-15') },
    { id: 2, no_sk: 'SK-002/2025', jumlah_data: 85, tanggal_penetapan: new Date('2025-02-20') },
    { id: 3, no_sk: 'SK-003/2025', jumlah_data: 200, tanggal_penetapan: new Date('2025-03-10') },
]

// Sub-komponen: Form Tambah Penetapan
interface TambahPenetapanFormProps {
    onBack: () => void
}

const TambahPenetapanForm: React.FC<TambahPenetapanFormProps> = ({ onBack }) => {
    const [fileUpload, setFileUpload] = useState<File | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Handle form submission
        console.log('Form submitted')
        onBack() // Kembali ke daftar setelah submit
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

            <p className="text-muted-foreground mb-2">Penetapan</p>
            <h1 className="text-2xl font-bold mb-6">Tambah Penetapan</h1>

            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-6">Form Pengisian Transaksi Penyampaian Data</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="jumlahData">Jumlah Data</Label>
                        <Input
                            id="jumlahData"
                            placeholder="Jumlah data"
                            required
                        />
                    </div>

                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="tanggalPenetapan" className="text-sm text-muted-foreground w-fit">Tanggal Penetapan</Label>
                        <Input
                            id="tanggalPenetapan"
                            type="date"
                            required
                        />
                    </div>

                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="noSkPenetapan">No. SK Penetapan</Label>
                        <Input
                            id="noSkPenetapan"
                            placeholder="No. SK Penetapan"
                            required
                        />
                    </div>

                    <div className="space-y-2 w-full md:w-1/3">
                        <Label htmlFor="fileUpload">Unggah SK Penetapan (.pdf)</Label>
                        <Input
                            id="fileUpload"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onBack}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-green-500 hover:bg-green-600">
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Sub-komponen: Daftar Penetapan
interface DaftarPenetapanProps {
    onAddClick: () => void
}

const DaftarPenetapan: React.FC<DaftarPenetapanProps> = ({ onAddClick }) => {
    const columns: ColumnConfig = {
        id: { label: 'ID' },
        no_sk: { label: 'No SK Penetapan' },
        jumlah_data: { label: 'Jumlah Data' },
        tanggal_penetapan: { label: 'Tanggal Penetapan', render: (v: Date) => dayjs(v).format('DD/MM/YYYY') },
    }

    const options: Option[] = Object.keys(columns).map((c) => ({
        value: c,
        label: columns[c].label
    }))

    const [searchString, setSearchString] = useState<string>()
    const [limit, setLimit] = useState(5)
    const [showCols, setShowCols] = useState<{ label: string, value: string }[]>(options)
    const [page, setPage] = useState(1)

    const totalPages = 2
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    const onPageChange = (num: number) => {
        setPage(num)
    }

    return (
        <Card>
            <CardHeader className="block sm:flex justify-between">
                <CardTitle className="text-xl text-[#1378B7] mb-3 sm:mb-0">Daftar Penetapan</CardTitle>
                <Button size='sm' className="bg-green-500 hover:bg-green-700" onClick={onAddClick}>
                    <div className="p-0.5 bg-white">
                        <Plus className="text-green-500" />
                    </div>
                    Tambah Penetapan
                </Button>
            </CardHeader>
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
                                <SelectTrigger className="w-full rounded-md p-1 pl-3 border text-start">
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
                <SinarParameterizedTable data={data} columns={columns} showCols={showCols} actHandler={(item) => console.log('Aksi:', item)} />
            </CardContent>
        </Card>
    )
}

// Komponen utama PenetapanTab
const PenetapanTab: React.FC = () => {
    const [view, setView] = useState<'list' | 'add'>('list')

    return (
        <div>
            {view === 'list' ? (
                <DaftarPenetapan onAddClick={() => setView('add')} />
            ) : (
                <TambahPenetapanForm onBack={() => setView('list')} />
            )}
        </div>
    )
}

export default PenetapanTab
