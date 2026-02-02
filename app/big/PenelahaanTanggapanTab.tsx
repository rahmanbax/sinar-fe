import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useApiHandlerWithPagination } from "@/utils/apiHandler"
import { ToponymAnnouncementTabular } from "@/types/Toponim"
import { ChevronLeft, ChevronRight, Download, Search, SlidersVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useCallback, useEffect, useState } from 'react'

const PenelahaanTanggapanTab: React.FC = () => {
    const router = useRouter()
    const columnsTanggapan: ColumnConfig = {
        id: { label: 'ID Toponim' },
        local_name: { label: 'Nama Lokal' },
        regency: { label: 'Kabupaten', render: (v) => v?.name || '-' },
        province: { label: 'Provinsi', render: (v) => v?.name || '-' },
        status_pembakuan: { 
            label: 'Status Pembakuan', 
            render: (v) => v || 'Belum Dibakukan'
        },
        status_data: { 
            label: 'Status Data', 
            render: (v) => v || 'Menunggu'
        },
    }

    const options: Option[] = Object.keys(columnsTanggapan).map((c) => ({
        value: c,
        label: columnsTanggapan[c].label
    }))

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<ToponymAnnouncementTabular[]>([])
    const apiHandler = useApiHandlerWithPagination<ToponymAnnouncementTabular>({ setLoading, shouldHandleError: true })

    const [searchString, setSearchString] = useState<string>()
    const [limit, setLimit] = useState(5)
    const [showCols, setShowCols] = useState<{ label: string, value: string }[]>(options)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    const onPageChange = (num: number) => {
        setPage(num)
    }

    const onAct = (data: ToponymAnnouncementTabular) => {
        if (!data.location_point?.coordinates) return
        router.push(`/?marker_id=${data.id}&lng=${data.location_point.coordinates[0]}&lat=${data.location_point.coordinates[1]}&zoom=15&limit=10`)
    }

    const refresh = useCallback(() => {
        let url = `/toponyms?page=${page}&per_page=${limit}`
        if (searchString) {
            url += `&search=${searchString}`
        }

        apiHandler('GET', url)
            .then(r => {
                if (!r?.data || !Array.isArray(r.data)) return
                setData(r.data)
                if (r.pagination) {
                    setTotalPages(r.pagination.last_page)
                }
            })
    }, [apiHandler, page, limit, searchString])

    useEffect(refresh, [refresh])

    return (
        <Card>
            <CardContent className="px-8 pt-6">
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
                    columns={columnsTanggapan}
                    showCols={showCols}
                    loading={loading}
                    actHandler={onAct}
                />
            </CardContent>
        </Card>
    )
}

export default PenelahaanTanggapanTab
