import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, Map, Plus, Search, SlidersVertical } from "lucide-react"
import Link from "next/link"
import { useState } from "react"


const data = [
    { id: 123456, source: 'test123', total_data: 10, accepted_data: 4, rejected_data: 6, acquisition_time: 'test123', user: 'SINAR', created_at: new Date(), updated_at: new Date() },
    { id: 223456, source: 'test123', total_data: 10, accepted_data: 4, rejected_data: 6, acquisition_time: 'test123', user: 'SINAR', created_at: new Date(), updated_at: new Date() },
    { id: 323456, source: 'test123', total_data: 10, accepted_data: 4, rejected_data: 6, acquisition_time: 'test123', user: 'SINAR', created_at: new Date(), updated_at: new Date() },
    { id: 423456, source: 'test123', total_data: 10, accepted_data: 4, rejected_data: 6, acquisition_time: 'test123', user: 'SINAR', created_at: new Date(), updated_at: new Date() },
    { id: 523456, source: 'test123', total_data: 10, accepted_data: 4, rejected_data: 6, acquisition_time: 'test123', user: 'SINAR', created_at: new Date(), updated_at: new Date() },
    { id: 623456, source: 'test123', total_data: 10, accepted_data: 4, rejected_data: 6, acquisition_time: 'test123', user: 'SINAR', created_at: new Date(), updated_at: new Date() }
]

const DataDeliveryTab: React.FC = () => {
    const columns: ColumnConfig = {
        id: { label: 'ID' },
        source: { label: 'Sumber Data' },
        total_data: { label: 'Jumlah Data' },
        accepted_data: { label: 'Data Diterima' },
        rejected_data: { label: 'Data Ditolak' },
        acquisition_time: { label: 'Waktu Akuisisi' },
        user: { label: 'Pengguna' },
        created_at: { label: 'Tanggal Dibuat', render: (v: Date) => dayjs(v).format('DD/MM/YYYY') },
        updated_at: { label: 'Tanggal Update', render: (v: Date) => dayjs(v).format('DD/MM/YYYY')}
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
                <CardTitle className="text-xl text-[#1378B7] mb-3 sm:mb-0">Daftar Transaksi Penyampaian Data Nama Rupabumi</CardTitle>
                <Button size='sm' className="bg-green-500 hover:bg-green-700">
                    <div className="p-0.5 bg-white">
                        <Plus className="text-green-500" />
                    </div>
                    Tambah Transaksi
                </Button>
            </CardHeader>
            <CardContent className="px-8">
                <div className="flex flex-col lg:flex-row lg:justify-between mb-5 gap-y-3">
                    <div className="flex gap-2">
                        <Button className="bg-green-500 hover:bg-green-700">Ajukan Data</Button>
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
                            {/* Prev Button */}
                            <Button
                                size="icon-sm"
                                disabled={page === 1}
                                variant='ghost'
                                onClick={() => onPageChange(page - 1)}
                            >
                                <ChevronLeft />
                            </Button>

                            {/* Page Numbers */}
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

                            {/* Next Button */}
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

export default DataDeliveryTab