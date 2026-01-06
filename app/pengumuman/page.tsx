"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { cn } from "@/lib/utils";
import { useGeolocated } from "react-geolocated";
import { useApiHandlerWithPagination, useApiHandler } from "@/utils/apiHandler";
import { NRB } from "@/types";
import { PiChatTeardropDots, PiChatTeardropDotsBold } from 'react-icons/pi'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Search, SlidersVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable";
import dayjs from "dayjs";
import { ToponymAnnouncementTabular } from "@/types/Toponim";
import { useRouter } from "next/navigation";

const Pengumuman: React.FC = () => {
  const columns: ColumnConfig = {
    id: { label: 'ID' },
    element: { label: 'Jenis Unsur', render: (v) => v?.name ?? '-' },
    local_name: { label: 'Nama Lokal' },
    map_name: { label: 'Nama Spesifik' },
    province: { label: 'Provinsi', render: (v) => v?.name ?? '-' },
    regency: { label: 'Kabupaten/Kota', render: (v) => v?.name ?? '-' },
  }

  const isInitialLoad = useRef(true)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [apiData, setData] = useState<ToponymAnnouncementTabular[]>([])
  const [sortBy, setSortBy] = useState<keyof typeof columns>('created_at')
  const [dataId, setDataId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [searchString, setSearchString] = useState<string | undefined>()
  const [filters, setFilters] = useState([])

  const [totalPages, setTotalPages] = useState(1)


  const apiHandler = useApiHandlerWithPagination<ToponymAnnouncementTabular>({ setLoading, shouldHandleError: true })

  const onPageChange = (num: number) => {
    setPage(num)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const onAct = (data: ToponymAnnouncementTabular) => {
    if (!data.location_point?.coordinates) return
    router.push(`/?marker_id=${data.id}&lng=${data.location_point.coordinates[0]}&lat=${data.location_point.coordinates[1]}&zoom=15&limit=10`)
  }

  const refresh = useCallback(() => {

    apiHandler('GET', `/toponyms?page=${page}&per_page=${limit}`)
      .then(r => {
        if (!r?.data || !Array.isArray(r.data)) return
        setData(r.data)
        if (r.pagination) {
          setTotalPages(r.pagination.last_page)
        }
      })

    isInitialLoad.current = false
  }, [apiHandler, page, limit, searchString])

  useEffect(refresh, [refresh])

  return (
    <>
      <SinarParameterizedTable data={apiData} loading={loading} columns={columns} actHandler={onAct} />
      <div className="flex justify-between items-center w-full mt-3">
        <h5>Menampilkan {limit} data per halaman</h5>
        <div className="flex items-center justify-center gap-2 bg-gray-50 p-2 rounded">
          <Button
            size="icon-sm"
            disabled={page === 1}
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
                  : "font-normal text-gray-600 hover:text-black hover:border"
              )}
            >
              {p}
            </Button>
          ))}

          <Button
            size="icon-sm"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </>
  )

}

const Tanggapan: React.FC = () => {
  const isInitialLoad = useRef(true)
  const [loading, setLoading] = useState(false)
  const apiHandler = useApiHandler<NRB[]>({ setLoading, shouldHandleError: true })
  const [apiData, setData] = useState<NRB[]>([])
  const [dataId, setDataId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [searchString, setSearchString] = useState<string | undefined>()
  const [filters, setFilters] = useState([])
  const totalPages = 2
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const columns = ['ID', 'Kode Pengumuman', 'Nama Rupabumi', 'Kolom Tanggapan', 'Isi Tanggapan', 'Pemberi Tanggapan', 'Tanggal Respon', 'Status', 'Detail']

  // const columns: ColumnConfig = {
  //   id: { label: 'ID' },
  //   issue_code: {label: 'Kode Pengumuman'},
  //   map_name: { label: 'Nama Rupabumi'},
  //   issue_column: { label: 'Kolom Tanggapan'},
  //   issue_value: {label: 'Isi Tanggapan'},
  //   issuer : {label: 'Pemberi Tanggapan'},
  //   issued_at: {label: 'Tanggal Respon'},
  //   status: {label: 'Status'},
  //   detail: {label: 'Detail'}
  // }

  const onPageChange = (num: number) => {
    setPage(num)
  }

  const refresh = useCallback(() => {

    apiHandler('GET', `/nrb?page=${page}&limit=${limit}`)
      .then(r => {
        setData(r)
      })

    isInitialLoad.current = false
  }, [apiHandler, page, limit, searchString])

  useEffect(refresh, [refresh])

  return (
    <>
      <Table>
        {/* <TableCaption className="text-start">Menampilkan 5 dari 1000 data</TableCaption> */}
        <TableHeader>
          <TableRow className="border-b-black">
            <TableHead className="pb-3">ID</TableHead>
            <TableHead className="pb-3">Kode Pengumuman</TableHead>
            <TableHead className="pb-3">Nama Rupabumi</TableHead>
            <TableHead className="pb-3">Kolom Tanggapan</TableHead>
            <TableHead className="pb-3">Isi Tanggapan</TableHead>
            <TableHead className="pb-3">Pemberi Tanggapan</TableHead>
            <TableHead className="pb-3">Tanggal Respon</TableHead>
            <TableHead className="pb-3">Status</TableHead>
            <TableHead className="pb-3">Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ?
            <>
              {Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length} className="pb-3">
                    <Skeleton className="h-8 w-full rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </> :
            apiData.map(data => (
              <TableRow key={data.id} className="border-b-black h-auto">
                <TableCell className="pb-3">
                  {data.id}
                </TableCell>
                <TableCell className="pb-3">
                  {data.id} - {data.elementType}
                </TableCell>
                <TableCell className="pb-3">
                  {data.elementType}
                </TableCell>
                <TableCell className="pb-3">
                  {data.localName}
                </TableCell>
                <TableCell className="pb-3">
                  {data.specificName}
                </TableCell>
                <TableCell className="pb-3">
                  {data.province}
                </TableCell>
                <TableCell className="pb-3">
                  {data.regency}
                </TableCell>
                <TableCell className="pb-3">
                  {data.regency}
                </TableCell>
                <TableCell className="pb-3">
                  <button
                    className="group flex items-center justify-center rounded-full p-1 bg-transparent hover:bg-gray-200 transition"
                  >
                    <Search
                      size={20}
                      className="text-gray-700 transition-all duration-300 group-hover:text-sky-500 group-hover:scale-125 group-hover:drop-shadow-lg"
                    />
                  </button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter className="flex">
        </TableFooter>
      </Table>
      <div className="flex justify-between items-center w-full">
        <h5>Menampilkan {limit} dari 10 data</h5>
        <div className="flex items-center justify-center gap-2 bg-gray-50 p-2 rounded">
          {/* Prev Button */}
          <Button
            size="icon-sm"
            disabled={page === 1}
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
                  : "font-normal text-gray-600 hover:text-black hover:border"
              )}
            >
              {p}
            </Button>
          ))}

          {/* Next Button */}
          <Button
            size="icon-sm"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </>
  )
}

const Page = () => {

  const [panel, setPanel] = useState('pengumuman')

  return (
    <PublicLayout>
      <div className="mt-24">
        <div className="flex flex-col items-center text-center text-wrap px-8 sm:px-20">
          <h1 className="text-3xl font-bold">Pengumuman Nama Rupabumi</h1>
          <p className="text-wrap">Periode Pengumuman: 08 September 2025 - 17 Oktober 2025</p>
          <p className="text-wrap"> Kode Pengumuman: P7/08S.17O/2025 </p>
        </div>
        <div className="px-8 sm:px-20 mt-8 mb-12">
          <div className="flex flex-col sm:flex-row justify-between mb-8">
            <div className="block lg:hidden mb-2 sm:mb-0 w-36">
              <Select onValueChange={(v) => setPanel(v)} value={panel}>
                <SelectTrigger className="w-full rounded-md shadow-md font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="pengumuman">Daftar Data</SelectItem>
                    <SelectItem value="tanggapan">Tanggapan</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden lg:flex gap-2">
              <Button size='lg' variant='ghost'
                className={`font-bold ${panel === 'pengumuman' ? 'text-black' : 'text-muted-foreground'}`}
                onClick={() => setPanel('pengumuman')}
              >Daftar Data</Button>
              <Button size='lg' variant='ghost'
                className={`font-bold ${panel === 'tanggapan' ? 'text-black' : 'text-muted-foreground'}`}
                onClick={() => setPanel('tanggapan')}
              >Daftar Tanggapan</Button>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex gap-2">
                <Button variant='ghost' className="shadow-md"><SlidersVertical />Filter</Button>
                <Button variant='ghost' className="shadow-md"><Download />Unduh</Button>
              </div>
              <InputGroup className='shadow-md w-72'>
                <InputGroupInput placeholder="Cari nama..." />
                <InputGroupAddon align='inline-end'>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
          {panel === 'tanggapan' ? <Tanggapan /> : <Pengumuman />}
        </div>
      </div>
    </PublicLayout>

  );
}

export default Page