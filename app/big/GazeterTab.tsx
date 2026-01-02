import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, File, Map, Search, SlidersVertical } from "lucide-react"
import Link from "next/link"
import { useState } from "react"


const data = [
    { id: 123456, sk_num: 'SK Kepala BIG No. 176.4 Tahun 2024', gazeter_edition: 'Test 123', issued_at: new Date(), created_at: new Date(), document_url: 'Test123' }
]

const GazeterForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [namaKegiatan, setNamaKegiatan] = useState('')
    const [tanggalMulai, setTanggalMulai] = useState('')
    const [tanggalHingga, setTanggalHingga] = useState('')
    const [jenisPerolehan, setJenisPerolehan] = useState('')
    const [metode, setMetode] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Handle form submission
        console.log({ namaKegiatan, tanggalMulai, tanggalHingga, jenisPerolehan, metode })
    }

    return (
        <Card>
            <CardTitle className="sr-only">Form Pembuatan Gazeter</CardTitle>
            <CardContent className="px-8 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={onBack}>
                        <ChevronLeft className="mr-1" /> Kembali
                    </Button>
                    <h2 className="text-xl font-semibold">Form Pembuatan Gazeter</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                        <Label htmlFor="namaKegiatan">Nama Kegiatan</Label>
                        <Input
                            id="namaKegiatan"
                            value={namaKegiatan}
                            onChange={(e) => setNamaKegiatan(e.target.value)}
                            placeholder="Masukkan nama kegiatan"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Waktu Akuisisi</Label>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <Label htmlFor="tanggalMulai" className="text-sm text-muted-foreground">Tanggal Mulai</Label>
                                <Input
                                    id="tanggalMulai"
                                    type="date"
                                    value={tanggalMulai}
                                    onChange={(e) => setTanggalMulai(e.target.value)}
                                />
                            </div>
                            <span className="mt-5">-</span>
                            <div className="flex-1">
                                <Label htmlFor="tanggalHingga" className="text-sm text-muted-foreground">Tanggal Hingga</Label>
                                <Input
                                    id="tanggalHingga"
                                    type="date"
                                    value={tanggalHingga}
                                    onChange={(e) => setTanggalHingga(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="jenisPerolehan">Jenis Perolehan Data</Label>
                        <Input
                            id="jenisPerolehan"
                            value={jenisPerolehan}
                            onChange={(e) => setJenisPerolehan(e.target.value)}
                            placeholder="Masukkan jenis perolehan data"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="metode">Metode</Label>
                        <Select value={metode} onValueChange={setMetode}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih metode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="survei">Survei Lapangan</SelectItem>
                                    <SelectItem value="digitasi">Digitasi</SelectItem>
                                    <SelectItem value="interpretasi">Interpretasi Citra</SelectItem>
                                    <SelectItem value="kompilasi">Kompilasi Data</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="bg-green-500 hover:bg-green-700">
                            Simpan
                        </Button>
                        <Button type="button" variant="outline" onClick={onBack}>
                            Batal
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const MyDataTab: React.FC = () => {
    const [showForm, setShowForm] = useState(false)

    const columns: ColumnConfig = {
        id: {
            label: 'ID'
        },
        sk_num: {
            label: 'Surat Keputusan'
        },
        gazeter_edition: {
            label: 'Edisi Gazeter'
        },
        issued_at: {
            label: 'Tanggal Penerbitan',
            render: (v: Date) => dayjs(v).format('DD/MM/YYYY')
        },
        created_at: {
            label: 'Tanggal Pembuatan',
            render: (v: Date) => dayjs(v).format('DD/MM/YYYY')
        },
        document_url: {
            label: 'Dokumen',
            render: (v: string) => (
                <Button variant='ghost' size='icon'>
                    <Link href={v}><File /></Link>
                </Button>
            )
        }
    }

    const options: Option[] = Object.keys(columns).map((c) => ({
        value: c,
        label: columns[c].label
    }))

    const [searchString, setSearchString] = useState<string>()
    const [limit, setLimit] = useState(5)
    const [showCols, setShowCols] = useState<Option[]>(options)
    const [page, setPage] = useState(1)

    const totalPages = 2
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    const onPageChange = (num: number) => {
        setPage(num)
    }

    if (showForm) {
        return <GazeterForm onBack={() => setShowForm(false)} />
    }

    return (
        <Card>
            <CardTitle className="sr-only">Data Saya</CardTitle>
            <CardContent className="px-8">
                <div className="flex flex-col lg:flex-row lg:justify-between mb-5 gap-y-3">
                    <div className="flex gap-2">
                        <Button className="bg-green-500 hover:bg-green-700" onClick={() => setShowForm(true)}>Ajukan Data</Button>
                        <InputGroup className='hidden sm:flex bg-neutral-50'>
                            <InputGroupInput placeholder="Cari..." onChange={(e) => setSearchString(e.target.value)} />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                        <Button variant='outline' size='icon-lg'><SlidersVertical /></Button>
                        <Link href='/'>
                            <Button variant='outline' size='lg'><Map /> Lihat Peta</Button>
                        </Link>
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
                                        <SelectItem value="5">
                                            5 Baris
                                        </SelectItem>
                                        <SelectItem value="10">
                                            10 Baris
                                        </SelectItem>
                                        <SelectItem value="20">
                                            20 Baris
                                        </SelectItem>
                                        <SelectItem value="100">
                                            100 Baris
                                        </SelectItem>
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
                <SinarParameterizedTable data={data} columns={columns} showCols={showCols} />
            </CardContent>
        </Card>
    )
}

export default MyDataTab