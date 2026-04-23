"use client";

import React, { useState, useMemo, useEffect } from "react";
import VerifikatorProvinsiLayout from "@/components/v2/nav/VerifikatorProvinsiLayout";
import { DataTable, ColumnDef } from "@/components/v2/table/DataTable";
import { 
    ArrowLeft, 
    Search, 
    FileText, 
    List, 
    MapPin, 
    File as FileIcon, 
    Check 
} from "lucide-react";
import { 
    useIncomingRecommendationDetail, 
    useAcceptIncomingRecommendation 
} from "@/hooks/useVerificationTransactions";
import { useParams, useRouter } from "next/navigation";

const IncomingRecommendationDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // Fetch Data from API
    const { data: detailRes, isLoading } = useIncomingRecommendationDetail(id);
    const acceptMutation = useAcceptIncomingRecommendation();

    const recommendation = detailRes?.data || {};
    // Transactions are typically in review_transactions for this payload structure
    const transactions = recommendation.review_transactions || recommendation.transactions || [];

    // States
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSesuai, setIsSesuai] = useState<boolean | null>(true); 
    const [alasan, setAlasan] = useState("");

    // Initialize selection (select all by default when data arrives)
    useEffect(() => {
        if (transactions.length > 0 && selectedIds.length === 0) {
            setSelectedIds(transactions.map((t: any) => String(t.id)));
        }
    }, [transactions]);

    // Toggle selection
    const toggleSelect = (txId: string) => {
        setSelectedIds(prev => 
            prev.includes(txId) 
                ? prev.filter(i => i !== txId) 
                : [...prev, txId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.map((t: any) => String(t.id)));
        }
    };

    const handleSubmit = async () => {
        if (acceptMutation.isPending) return;

        acceptMutation.mutate({
            id: id,
            data: {
                transaction_ids: selectedIds,
                is_sesuai: !!isSesuai,
                alasan: !isSesuai ? alasan : undefined
            }
        }, {
            onSuccess: (res) => {
                if (!res.error) {
                    alert("Rekomendasi berhasil diberikan");
                    router.push("/v2/verifikator-provinsi/data-kabupaten-kota");
                } else {
                    alert(res.message || "Gagal memberikan rekomendasi");
                }
            },
            onError: () => {
                alert("Terjadi kesalahan koneksi");
            }
        });
    };

    const columns: ColumnDef<any>[] = [
        {
            header: (
                <div className="flex justify-center">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.length === transactions.length && transactions.length > 0}
                        onChange={toggleSelectAll}
                    />
                </div>
            ),
            cell: (row) => (
                <div className="flex justify-center">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.includes(String(row.id))}
                        onChange={() => toggleSelect(String(row.id))}
                    />
                </div>
            ),
            className: "w-12"
        },
        { header: "No", cell: (_, idx) => idx + 1, className: "w-12 text-center" },
        { 
            header: "No. BA", 
            cell: (row) => (
                <div className="font-medium text-navy-900">
                    {row.ref_number || row.ba_number || row.number || "-"}
                </div>
            ), 
            className: "w-48" 
        },
        { 
            header: "Judul Penelaahan", 
            cell: (row) => (
                <div className="font-bold text-navy-900">
                    {row.title || "-"}
                </div>
            )
        },
        { 
            header: "Jumlah Data", 
            cell: (row) => (
                <div className="text-center text-gray-900">
                    {row.total_data ?? row.toponyms_count ?? "-"}
                </div>
            ),
            className: "text-center w-32" 
        },
        {
            header: "Aksi",
            className: "w-28 text-center",
            cell: () => (
                <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-navy-900 transition-colors">
                        <Search size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-navy-900 transition-colors">
                        <FileText size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-navy-900 transition-colors">
                        <List size={16} />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <VerifikatorProvinsiLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse font-medium">Memuat data rekomendasi...</p>
                </div>
            </VerifikatorProvinsiLayout>
        );
    }

    const currentRefNumber = recommendation.ref_number || recommendation.recommendation_number || recommendation.number || "-";

    return (
        <VerifikatorProvinsiLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-navy-900">Data Kab/Kota</h1>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => router.back()}
                                className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                            >
                                <ArrowLeft size={20} className="text-gray-900" />
                            </button>
                            <span className="text-lg font-bold text-navy-900">No. {currentRefNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <MapPin size={16} className="fill-blue-600" />
                            <span className="text-sm font-bold">{recommendation.source_region_name || "-"}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[400px]">
                            <h2 className="font-bold text-gray-900 mb-6">Daftar Penelaahan</h2>
                            <DataTable 
                                columns={columns} 
                                data={transactions} 
                                showSearch={false} 
                                showFilter={false} 
                                emptyMessage="Tidak ada transaksi dalam rekomendasi ini"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Data</label>
                                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-navy-900 font-semibold">
                                        {recommendation.toponyms_count || 0}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">No. Surat Rekomendasi</label>
                                    <div className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-navy-900 font-semibold">
                                        {currentRefNumber}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview Dokumen</label>
                                <div className="border border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-3 text-center bg-gray-50/30">
                                    <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-navy-900">
                                        <FileIcon size={24} />
                                    </div>
                                    <p className="text-[11px] font-semibold text-gray-900 max-w-[200px] leading-relaxed line-clamp-2">
                                        {recommendation.document_name || recommendation.recommendation_doc_url?.split('/').pop() || "Surat Rekomendasi.pdf"}
                                    </p>
                                    <a 
                                        href={recommendation.recommendation_doc_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 text-xs font-bold hover:underline bg-blue-50 px-4 py-1.5 rounded-full"
                                    >
                                        Lihat
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => setIsSesuai(true)}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isSesuai ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-400'}`}
                                >
                                    Sesuai
                                </button>
                                <button 
                                    onClick={() => setIsSesuai(false)}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isSesuai ? 'bg-navy-900 text-white shadow-sm' : 'text-gray-400'}`}
                                >
                                    Tidak Sesuai
                                </button>
                            </div>

                            {!isSesuai && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alasan Tidak Sesuai</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Masukkan alasan ketidaksesuaian data..."
                                        value={alasan}
                                        onChange={(e) => setAlasan(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-navy-900 transition-all resize-none shadow-sm"
                                    />
                                </div>
                            )}

                            <button 
                                onClick={handleSubmit}
                                disabled={acceptMutation.isPending || selectedIds.length === 0}
                                className={`w-full py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    acceptMutation.isPending || selectedIds.length === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 active:scale-[0.98]'
                                }`}
                            >
                                {acceptMutation.isPending ? "Memproses..." : "Beri Rekomendasi"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </VerifikatorProvinsiLayout>
    );
};

export default IncomingRecommendationDetailPage;
