import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, Map, Search, SlidersVertical } from "lucide-react"
import Link from "next/link"
import { useState } from "react"


const data = [
    { id: 123456, survey_date: new Date(), category: 'Test 123', sub_category: 'Test123', generic_name: 'Test 123', specific_name: 'Test123', province: 'province', regency: 'regency', status: 'Data Survei' }
]

const MyDataTab: React.FC = () => {
    const columns : ColumnConfig = {
        id: {label: 'ID'},
        survey_date: {label: 'Tanggal Survey', render: (v: Date) => dayjs(v).format('DD/MM/YYYY')},
        category: {label: 'Kategori'}, 
        sub_category: {label: 'Sub Kategori'},
        generic_name: {label: 'Elemen Generik'}, 
        specific_name: {label: 'Elemen Spesifik'},
        province: {label: 'Provinsi'},
        regency: {label: 'Kota/Kabupaten'},
        status: {label: 'Status'}
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

    return (
        <Card>
            <CardTitle className="sr-only">Data Saya</CardTitle>
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

export default MyDataTab