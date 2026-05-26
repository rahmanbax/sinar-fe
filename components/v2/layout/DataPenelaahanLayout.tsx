"use client";

import React from 'react';
import { Search, SlidersHorizontal, LayoutDashboard, Table, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/v2/table/DataTable';
import ReviewCard from '@/components/v2/card/ReviewCard';
import { VerificationTransaction } from '@/api/verification';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDataPenelaahanStore } from '@/store/useDataPenelaahanStore';

interface DataPenelaahanLayoutProps {
    loadingTransactions: boolean;
    filteredTransactions: VerificationTransaction[];
    token: string | null;
    refetchTransactions: () => void;
    transactionPagination?: React.ComponentProps<typeof DataTable<VerificationTransaction>>['pagination'];
    transactionColumns: ColumnDef<VerificationTransaction>[];
}

const DataPenelaahanLayout: React.FC<DataPenelaahanLayoutProps> = ({
    loadingTransactions,
    filteredTransactions,
    token,
    refetchTransactions,
    transactionPagination,
    transactionColumns,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { searchText, setSearchText, transactionPage, setTransactionPage, viewMode } = useDataPenelaahanStore();

    const handleSetViewMode = (mode: 'grid' | 'table') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', mode);
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg flex-1 sm:flex-initial w-full sm:w-75 border border-gray-200 min-w-0">
                        <Search size={16} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="bg-transparent text-sm w-full outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-bold border border-gray-200 cursor-pointer shrink-0">
                        <SlidersHorizontal size={16} /> Filter
                    </button>
                </div>
                <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                        onClick={() => handleSetViewMode('grid')}
                        title="Tampilan Kartu"
                        className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'grid'
                            ? 'bg-navy-50 text-navy-500'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutDashboard size={24} fill={viewMode === 'grid' ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={() => handleSetViewMode('table')}
                        title="Tampilan Tabel"
                        className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'table'
                            ? 'bg-navy-50 text-navy-500'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <Table size={24} />
                    </button>
                </div>
            </div>
            {loadingTransactions && viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <ReviewCard key={idx} isLoading={true} />
                    ))}
                </div>
            ) : viewMode === 'grid' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {filteredTransactions.map((item: VerificationTransaction) => (
                            <ReviewCard
                                key={item.id}
                                item={item}
                                token={token}
                                onRefresh={refetchTransactions}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                    {transactionPagination && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-10 mt-2">
                            <span className="text-[13px] text-gray-500">
                                Menampilkan{' '}
                                {transactionPagination.from && transactionPagination.to
                                    ? transactionPagination.to - transactionPagination.from + 1
                                    : 0}{' '}
                                dari {transactionPagination.total} data
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    disabled={transactionPagination.current_page <= 1}
                                    onClick={() => setTransactionPage(transactionPage - 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-500 text-white hover:bg-navy-400 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(5, transactionPagination.last_page) }).map((_, i) => {
                                    let pageNum = i + 1;
                                    if (transactionPagination.last_page > 5 && transactionPagination.current_page > 3) {
                                        pageNum = transactionPagination.current_page - 2 + i;
                                    }
                                    if (pageNum > transactionPagination.last_page) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setTransactionPage(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition cursor-pointer ${transactionPagination.current_page === pageNum
                                                ? 'text-black'
                                                : 'text-gray-400 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                {transactionPagination.last_page > 5 &&
                                    transactionPagination.current_page < transactionPagination.last_page - 2 && (
                                        <>
                                            <span className="text-gray-400 px-1">...</span>
                                            <button
                                                onClick={() => setTransactionPage(transactionPagination.last_page)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full text-navy-500 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                {transactionPagination.last_page}
                                            </button>
                                        </>
                                    )}
                                <button
                                    disabled={transactionPagination.current_page >= transactionPagination.last_page}
                                    onClick={() => setTransactionPage(transactionPage + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-500 text-white hover:bg-navy-400 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <DataTable
                    columns={transactionColumns}
                    data={filteredTransactions}
                    isLoading={loadingTransactions}
                    showSearch={false}
                    showFilter={false}
                    pagination={transactionPagination}
                    onPageChange={setTransactionPage}
                />
            )}
        </>
    );
};

export default DataPenelaahanLayout;
