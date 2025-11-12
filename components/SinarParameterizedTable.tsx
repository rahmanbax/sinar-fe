/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { ChevronRight, ChevronLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface ISinarParameterizedTable<T extends Record<string, any>> {
    data: T[]
    loading: boolean
    totalPages: number
    limit: number
    page: number
    onPageChange: (page: number) => void
    columns: Partial<Record<keyof T, string>>
    /** Optional custom render function for each row */
    renderRow?: (item: T) => React.ReactNode
   
}


const SinarParameterizedTable = <T extends Record<string, any>>({
    data,
    loading,
    totalPages,
    limit,
    page,
    onPageChange,
    columns,
    renderRow
}: ISinarParameterizedTable<T>) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-b-black">
                        {Object.values((columns)).map((col) => (
                            <TableHead key={String(col)} className="pb-3 capitalize">
                                {String(col)}
                            </TableHead>
                        ))}
                        <TableHead className="pb-3">Aksi</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }, (_, i) => (
                            <TableRow key={i}>
                                <TableCell colSpan={Object.keys(columns).length + 1}>
                                    <Skeleton className="h-8 w-full rounded-md" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : data.length ? (
                        data.map((d, i) => (
                            <TableRow key={i} className="border-b-black h-auto">
                                {renderRow
                                    ? renderRow(d)
                                    : Object.keys(columns).map((col) => (
                                        <TableCell key={col} className="pb-3">
                                            {String(d[col])}
                                        </TableCell>
                                    ))}
                                <TableCell className="pb-3">
                                    <button className="group flex items-center justify-center rounded-full p-1 bg-transparent hover:bg-gray-200 transition">
                                        <Search
                                            size={20}
                                            className="text-gray-700 transition-all duration-300 group-hover:text-sky-500 group-hover:scale-125 group-hover:drop-shadow-lg"
                                        />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={Object.keys(columns).length + 1} className="text-center py-4">
                                No data found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

                <TableFooter />
            </Table>

            {/* Pagination */}
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

export default SinarParameterizedTable