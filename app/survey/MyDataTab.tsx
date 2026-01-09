import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { StandardToponim } from "@/types/Toponim"
import { useApiHandlerWithPagination } from "@/utils/apiHandler"
import { ChevronLeft, ChevronRight, Map, Search, SlidersVertical } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

type ApiResponse = {
    data: StandardToponim[]
    pagination: {
        total: number
        per_page: number
        current_page: number
        last_page: number
    }
}

const MyDataTab: React.FC = () => {
    const columns: ColumnConfig = {
        id: { label: 'ID' },
        element_type: { label: 'Jenis Unsur' },
        generic_name: { label: 'Elemen Generik' },
        specific_name: { label: 'Elemen Spesifik' },
        province: { label: 'Provinsi' },
        regency: { label: 'Kota/Kabupaten' },
        source: { label: 'Sumber Data' },
        status: { label: 'Status' }
    }

    const options: Option[] = Object.keys(columns).map((c) => ({
        value: c,
        label: columns[c].label
    }))

    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandlerWithPagination<StandardToponim>({ setLoading, shouldHandleError: true })
    const [data, setData] = useState<Record<string, unknown>[]>([])
    const [searchString, setSearchString] = useState<string>()
    const [limit, setLimit] = useState(5)
    const [showCols, setShowCols] = useState<Option[]>(options)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    const onPageChange = (num: number) => {
        setPage(num)
    }

    const refresh = useCallback(() => {
        apiHandler('GET', `/survey/toponyms?page=${page}&per_page=${limit}`)
            .then(r => {
                if (!r?.data || !Array.isArray(r.data)) return
                const mapped = r.data.map(item => ({
                    id: item.id,
                    element_type: item.element?.name ?? '-',
                    generic_name: item.local_name,
                    specific_name: item.map_name,
                    province: item.province?.name ?? '-',
                    regency: item.regency?.name ?? '-',
                    source: item.source,
                    status: item.status
                }))
                setData(mapped)
                if (r.pagination) {
                    setTotalPages(r.pagination.last_page)
                }
            })
    }, [apiHandler, page, limit])

    useEffect(refresh, [refresh])

    return (
        <Card>
            <CardTitle className="sr-only">Data Saya</CardTitle>
            <CardContent className="px-8">
                <div className="flex justify-end items-center mb-5">
                    <Link href="/survey/tambah-toponim">
                        <Button className="bg-green-500 hover:bg-green-700">Tambah Data Toponim</Button>
                    </Link>
                </div>
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
                <SinarParameterizedTable data={data} columns={columns} showCols={showCols} loading={loading} />
            </CardContent>
        </Card>
    )
}

export default MyDataTab