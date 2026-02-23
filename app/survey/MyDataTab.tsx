import { MultiSelect, Option } from "@/components/MultiSelect";
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StandardToponim } from "@/types/Toponim";
import { useApiHandlerWithPagination } from "@/utils/apiHandler";
import { ChevronLeft, ChevronRight, Map, Search, SlidersVertical } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapModal } from "@/components/map/MapModal";


// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

type ApiResponse = {
    data: StandardToponim[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
        "data survei": { bg: "bg-blue-100", text: "text-blue-800", label: "Data Survei" },
        "penelaahan kabupaten/kota": { bg: "bg-yellow-100", text: "text-yellow-800", label: "Penelaahan Kabupaten/Kota" },
        "penelaahan provinsi": { bg: "bg-orange-100", text: "text-orange-800", label: "Penelaahan Provinsi" },
        "penelaahan pusat": { bg: "bg-red-100", text: "text-red-800", label: "Penelaahan Pusat" },
        "penetapan": { bg: "bg-green-100", text: "text-green-800", label: "Penetapan" },
        "draft pengumuman": { bg: "bg-purple-100", text: "text-purple-800", label: "Draft Pengumuman" },
        "permohonan rekomendasi": { bg: "bg-indigo-100", text: "text-indigo-800", label: "Permohonan Rekomendasi" },
        "rekomendasi provinsi": { bg: "bg-teal-100", text: "text-teal-800", label: "Rekomendasi Provinsi" },
        "penelaahan tanggapan": { bg: "bg-pink-100", text: "text-pink-800", label: "Penelaahan Tanggapan" },
        "penggantian": { bg: "bg-amber-100", text: "text-amber-800", label: "Penggantian" },
        "penghapusan": { bg: "bg-slate-100", text: "text-slate-800", label: "Penghapusan" },
        "pengajuan": { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pengajuan" },
        "baku": { bg: "bg-blue-100", text: "text-blue-800", label: "Baku" },
    };
    const style = statusStyles[s] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${style.bg} ${style.text}`}> {style.label}</span>;
};

const MyDataTab: React.FC = () => {
    const router = useRouter();

    const columns: ColumnConfig = {
        no: { label: "No" },
        created_at: { label: "Tanggal Dibuat" },
        survey_at: { label: "Tanggal Survei" },
        element_type: { label: "Jenis Unsur" },
        generic_element: { label: "Elemen Generik" },
        specific_element: { label: "Elemen Spesifik" },
        province: { label: "Provinsi" },
        regency: { label: "Kota/Kabupaten" },
        source: { label: "Sumber Data" },
        status: { label: "Status", render: (value: string) => getStatusBadge(value) },
    };

    const options: Option[] = Object.keys(columns).map((c) => ({
        value: c,
        label: columns[c].label,
    }));

    const [loading, setLoading] = useState(false);
    const apiHandler = useApiHandlerWithPagination<StandardToponim>({ setLoading, shouldHandleError: true });
    const [data, setData] = useState<Record<string, unknown>[]>([]);
    const [searchString, setSearchString] = useState<string>("");
    const debouncedSearch = useDebounce(searchString, 500);
    const [limit, setLimit] = useState(5);
    const [showCols, setShowCols] = useState<Option[]>(options);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const onPageChange = (num: number) => {
        setPage(num);
    };

    const refresh = useCallback(() => {
        const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
        apiHandler("GET", `/survey/toponyms?page=${page}&per_page=${limit}${searchParam}`).then((r) => {
            if (!r?.data || !Array.isArray(r.data)) return;
            const mapped = r.data.map((item, index) => ({
                no: (page - 1) * limit + (index + 1),
                id: item.id,
                created_at: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
                survey_at: item.survey_at ? new Date(item.survey_at).toLocaleDateString("id-ID") : "-",
                element_type: item.element?.name ?? "-",
                generic_element: item.generic_element,
                specific_element: item.specific_element,
                local_name: item.local_name,
                map_name: item.map_name,
                province: item.province?.name ?? "-",
                regency: item.regency?.name ?? "-",
                source: item.source,
                status: item.status || "pengajuan",
            }));
            setData(mapped);
            if (r.pagination) {
                setTotalPages(r.pagination.last_page);
            }
        });
    }, [apiHandler, page, limit, debouncedSearch]);

    // Reset to page 1 when search or limit changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, limit]);

    useEffect(refresh, [refresh]);

    return (
        <Card>
            <CardTitle className="sr-only">Data Saya</CardTitle>
            <CardContent className="px-8">
                <div className="flex flex-col lg:flex-row lg:justify-between mb-5 gap-y-3">
                    <div className="flex gap-2">
                        <Link href="/survey/tambah-toponim">
                            <Button className="bg-green-500 hover:bg-green-700">Tambah Data</Button>
                        </Link>
                        <InputGroup className="hidden sm:flex bg-neutral-50">
                            <InputGroupInput placeholder="Cari..." onChange={(e) => setSearchString(e.target.value)} />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                        <Button variant="outline" size="icon-lg">
                            <SlidersVertical />
                        </Button>
                        <MapModal />

                    </div>
                    <InputGroup className="flex sm:hidden bg-neutral-50">
                        <InputGroupInput placeholder="Cari..." onChange={(e) => setSearchString(e.target.value)} />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    <div className="hidden sm:flex gap-2 items-center justify-center lg:justify-end w-full lg:w-2/3">
                        <h5 className="font-semibold">Tampilkan</h5>
                        <MultiSelect options={options} selected={showCols} onChange={setShowCols} className="w-1/4" />
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
                            <Button size="icon-sm" disabled={page === 1} variant="ghost" onClick={() => onPageChange(page - 1)}>
                                <ChevronLeft />
                            </Button>

                            {/* Smart Pagination Logic */}
                            {(() => {
                                const pageNumbers: (number | string)[] = [];
                                const showEllipsisStart = page > 3;
                                const showEllipsisEnd = page < totalPages - 2;

                                // Always show first page
                                pageNumbers.push(1);

                                // Show ellipsis or pages before current
                                if (showEllipsisStart) {
                                    pageNumbers.push("...");
                                    // Show 2 pages before current
                                    if (page - 1 > 1) pageNumbers.push(page - 1);
                                } else {
                                    // Show all pages from 2 to current-1
                                    for (let i = 2; i < page; i++) {
                                        pageNumbers.push(i);
                                    }
                                }

                                // Show current page (if not first or last)
                                if (page !== 1 && page !== totalPages) {
                                    pageNumbers.push(page);
                                }

                                // Show ellipsis or pages after current
                                if (showEllipsisEnd) {
                                    // Show 2 pages after current
                                    if (page + 1 < totalPages) pageNumbers.push(page + 1);
                                    pageNumbers.push("...");
                                } else {
                                    // Show all pages from current+1 to totalPages-1
                                    for (let i = page + 1; i < totalPages; i++) {
                                        pageNumbers.push(i);
                                    }
                                }

                                // Always show last page (if more than 1 page)
                                if (totalPages > 1) {
                                    pageNumbers.push(totalPages);
                                }

                                return pageNumbers.map((p, idx) => {
                                    if (p === "...") {
                                        return (
                                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                                ...
                                            </span>
                                        );
                                    }
                                    return (
                                        <Button key={p} variant="ghost" size="sm" onClick={() => onPageChange(p as number)} className={cn("text-sm transition-all", page === p ? "font-bold text-black" : "font-normal text-muted-foreground")}>
                                            {p}
                                        </Button>
                                    );
                                });
                            })()}

                            <Button size="icon-sm" disabled={page === totalPages} variant="ghost" onClick={() => onPageChange(page + 1)}>
                                <ChevronRight />
                            </Button>
                        </div>
                    </div>
                </div>
                <SinarParameterizedTable data={data} columns={columns} showCols={showCols} loading={loading} actHandler={(item) => router.push(`/survey/edit-toponim?id=${item.id}`)} />
            </CardContent>
        </Card>
    );
};

export default MyDataTab;
