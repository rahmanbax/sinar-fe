/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { ChevronRight, ChevronLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import dayjs from 'dayjs'

// this is wrong, uncompleted
export type ColumnConfig = {
    [k: string]: {
        label: string
        render?: (v: any) => React.ReactNode
    }
}

interface ISinarParameterizedTable<T extends Record<string, any>> {
    data: T[]
    loading?: boolean
    columns: ColumnConfig
    showCols?: { value: string, label: string }[]
    /** Optional custom render function for each row */
    renderRow?: (item: T) => React.ReactNode
}

const SinarParameterizedTable = <T extends Record<string, any>>({
    data,
    loading = false,
    columns,
    showCols,
    renderRow
}: ISinarParameterizedTable<T>) => {

    const showedColumns = showCols ? Object.fromEntries(Object.entries(columns).filter(([key]) => showCols.some(o => o.value === key))) : columns

    return (
        <Table className="overflow-hidden">
            <TableHeader>
                <TableRow className="border-b-black">
                    {Object.keys(showedColumns).map((col) => (
                        <TableHead key={String(col)} className="pb-3 capitalize">
                            {showedColumns[col].label}
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
                                        {columns[col].render ? columns[col].render(d[col]) : d[col]}
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

    )
}

export default SinarParameterizedTable