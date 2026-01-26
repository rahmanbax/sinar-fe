import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PaginationInfo, useApiHandlerWithPagination } from "@/utils/apiHandler"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, File, Image as ImageIcon, Map, Search, SlidersVertical } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Gazetteer {
    id: string
    title: string
    edition: string
    cover_img: string
    published_at: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}





const MyDataTab: React.FC = () => {
    const [data, setData] = useState<Gazetteer[]>([])
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchString, setSearchString] = useState<string>('')
    const [limit, setLimit] = useState(5)
    const [page, setPage] = useState(1)
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const apiHandler = useApiHandlerWithPagination<Gazetteer>({
        setLoading
    })

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchString)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchString])

    useEffect(() => {
        setPage(1)
    }, [limit, debouncedSearch])

    const fetchData = () => {
        apiHandler('GET', `/big/gazetteer?page=${page}&per_page=${limit}${debouncedSearch ? `&search=${debouncedSearch}` : ''}`)
            .then((res) => {
                setData(res.data)
                setPagination(res.pagination)
            })
            .catch((err) => {
                console.error(err)
            })
    }

    useEffect(() => {
        fetchData()
    }, [page, limit, debouncedSearch])

    const columns: ColumnConfig = {
        no: {
            label: 'No.'
        },
        title: {
            label: 'Judul'
        },
        edition: {
            label: 'Edisi Gazeter'
        },
        published_at: {
            label: 'Tanggal Penerbitan',
            render: (v: string | null) => v ? dayjs(v).format('DD/MM/YYYY') : '-'
        },
        created_at: {
            label: 'Tanggal Pembuatan',
            render: (v: string) => dayjs(v).format('DD/MM/YYYY')
        },
        // cover_img: {
        //     label: 'Sampul',
        //     render: (v: string) => (
        //         <Button variant='ghost' size='icon'>
        //             <Link href={v} target="_blank"><ImageIcon /></Link>
        //         </Button>
        //     )
        // }
    }

    const options: Option[] = Object.keys(columns).map((c) => ({
        value: c,
        label: columns[c].label
    }))

    const [showCols, setShowCols] = useState<Option[]>(options)

    const totalPages = pagination?.last_page || 1
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
                        <Link href='/big/tambah-gazetteer'>
                            <Button className="bg-green-500 hover:bg-green-700">Ajukan Data</Button>
                        </Link>
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
                <SinarParameterizedTable
                    data={data.map((item, index) => ({ ...item, no: (page - 1) * limit + index + 1 }))}
                    columns={columns}
                    showCols={showCols}
                    loading={loading}
                />
            </CardContent>
        </Card>
    )
}

export default MyDataTab
