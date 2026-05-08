"use client"

import React, { useState, useEffect, useRef } from "react";
import { Loader2, FileX, Search, SlidersHorizontal, Download, Map as MapIcon, ChevronLeft, ChevronRight } from "lucide-react";

export interface ColumnDef<TData> {
    header: string | React.ReactNode;
    accessorKey?: keyof TData;
    cell?: (row: TData, index: number) => React.ReactNode;
    className?: string; // Optional custom width or styling for the column
}

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    isLoading?: boolean;
    emptyMessage?: string;
    showSearch?: boolean;
    showFilter?: boolean;
    showDownload?: boolean;
    showMap?: boolean;
    initialSearch?: string;
    onSearch?: (value: string) => void;
    onFilter?: () => void;
    onDownload?: () => void;
    onMap?: () => void;
    pagination?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
    onPageChange?: (page: number) => void;
}

export function DataTable<TData>({
    columns,
    data,
    isLoading = false,
    emptyMessage = "Data tidak ditemukan",
    showSearch = true,
    showFilter = true,
    showDownload = false,
    showMap = false,
    initialSearch = "",
    onSearch,
    onFilter,
    onDownload,
    onMap,
    pagination,
    onPageChange,
}: DataTableProps<TData>) {
    const [searchValue, setSearchValue] = useState(initialSearch);
    const isFirstRender = useRef(true);
    const onSearchRef = useRef(onSearch);

    // Keep the ref updated with the latest onSearch prop
    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    // Sync external search value changes (e.g., from URL params)
    useEffect(() => {
        setSearchValue(initialSearch);
    }, [initialSearch]);

    // Only fire search when searchValue actually changes (and debounced)
    useEffect(() => {
        // Prevent firing on mount which would reset the page to 1 unnecessarily
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            if (onSearchRef.current) {
                onSearchRef.current(searchValue);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchValue]);

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar Top */}
            <div className="flex flex-wrap items-center gap-3">
                {showSearch && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg min-w-[250px] border border-gray-200">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari"
                            className="bg-transparent text-sm w-full outline-none text-black placeholder:text-gray-400"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                )}

                {showFilter && (
                    <button
                        onClick={onFilter}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                    >
                        <SlidersHorizontal size={16} /> Filter
                    </button>
                )}

                {showDownload && (
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                    >
                        <Download size={16} /> Unduh
                    </button>
                )}

                {showMap && (
                    <button
                        onClick={onMap}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                    >
                        <MapIcon size={16} /> Lihat Peta
                    </button>
                )}
            </div>

            {/* Table Container */}
            <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="border-b border-gray-200 text-gray-500 font-medium">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={`px-3 py-3 whitespace-nowrap bg-gray-100 ${col.className || ""}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, rowIndex) => (
                                    <tr key={`skeleton-row-${rowIndex}`} className="animate-pulse bg-white border-b border-gray-100 last:border-0">
                                        {columns.map((col, colIndex) => (
                                            <td key={`skeleton-col-${colIndex}`} className={`px-3 py-4 ${col.className || ""}`}>
                                                <div className="h-4 bg-gray-200 rounded-sm w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-6 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                                            <span className="text-sm font-medium">{emptyMessage}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`px-3 py-3 text-black ${col.className || ""}`}
                                            >
                                                {col.cell
                                                    ? col.cell(row, rowIndex)
                                                    : col.accessorKey
                                                        ? String(row[col.accessorKey] ?? "-")
                                                        : null}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Bottom */}
            {pagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 mb-2">
                    <span className="text-[13px] text-gray-500">
                        Menampilkan <span className="">{pagination.to - pagination.from + 1 || 0}</span> dari <span className="">{pagination.total}</span> data
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            disabled={pagination.current_page <= 1}
                            onClick={() => onPageChange && onPageChange(pagination.current_page - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-500 text-white hover:bg-navy-400 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Pagination Numbers (Simplified for demo) */}
                        {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, i) => {
                            // Logic to show a window around current page
                            let pageNum = i + 1;
                            if (pagination.last_page > 5) {
                                if (pagination.current_page > 3) {
                                    pageNum = pagination.current_page - 2 + i;
                                }
                                if (pageNum > pagination.last_page) return null;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange && onPageChange(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition cursor-pointer hover:bg-gray-100 ${pagination.current_page === pageNum
                                        ? ""
                                        : "text-gray-400"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {pagination.last_page > 5 && pagination.current_page < pagination.last_page - 2 && (
                            <>
                                <span className="text-gray-400 px-1">...</span>
                                <button
                                    onClick={() => onPageChange && onPageChange(pagination.last_page)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-navy-700 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                                >
                                    {pagination.last_page}
                                </button>
                            </>
                        )}

                        <button
                            disabled={pagination.current_page >= pagination.last_page}
                            onClick={() => onPageChange && onPageChange(pagination.current_page + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-500 text-white hover:bg-navy-400 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
