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

    // API Hooks
    const { data: detailRes, isLoading: isApiLoading } = useIncomingRecommendationDetail(id);
    const acceptMutation = useAcceptIncomingRecommendation();

    // Map Real Data from API Response
    // The JSON object has metadata inside the key "0" and the transactions array inside "data"
    const recommendation = detailRes?.recommendation || 
                           (Array.isArray(detailRes?.["0"]) ? detailRes?.["0"]?.[0] : (detailRes?.["0"]?.recommendation || detailRes?.["0"])) || 
                           {};
    const transactions = detailRes?.data || [];

    // Calculate total data from all transactions
    const totalDataCount = useMemo(() => {
        if (!transactions.length) return 0;
        return transactions.reduce((acc: number, curr: any) => acc + (curr.total_data || 0), 0);
    }, [transactions]);

    // States
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSesuai, setIsSesuai] = useState<boolean | null>(true); 
    const [alasan, setAlasan] = useState("");

    // Initialize selection
    useEffect(() => {
        if (transactions.length > 0 && selectedIds.length === 0) {
            setSelectedIds(transactions.map((t: any) => String(t.id)));
        }
    }, [transactions, selectedIds.length]);

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
            onError: (err) => {
                alert("Terjadi kesalahan koneksi");
                console.error(err);
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
        { header: "No", cell: (_, idx) => idx + 1, className: "w-12 text-center text-gray-500" },
        { 
            header: "No. BA", 
            cell: () => (
                <div className="font-medium text-navy-900">
                    -
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
                    {row.total_data ?? "-"}
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

    const currentRefNumber = recommendation.ref_number || "-";
    const documentName = `Surat Rekomendasi No. ${currentRefNumber}.pdf`;

    return (
        <VerifikatorProvinsiLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Data Kabupaten/ Kota</h1>
                        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
                            <MapPin size={16} className="fill-blue-600" />
                            <span className="text-sm font-bold tracking-wide">{recommendation.source_region?.name || "-"}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()}
                            className="p-1.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 rounded-lg transition-all cursor-pointer group"
                        >
                            <ArrowLeft size={20} className="text-gray-900 group-hover:scale-110 transition-transform" />
                        </button>
                        <span className="text-lg font-bold text-navy-900">No. {currentRefNumber}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm min-h-[450px]">
                            <h2 className="font-bold text-navy-900 mb-8 text-lg">
                                Daftar Penelaahan
                            </h2>
                            <DataTable 
                                columns={columns} 
                                data={transactions} 
                                showSearch={false} 
                                showFilter={false} 
                                emptyMessage="Tidak ada transaksi dalam rekomendasi ini"
                                isLoading={isApiLoading}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col gap-8">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Jumlah Data</label>
                                    <div className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl text-navy-900 font-bold text-lg">
                                        {totalDataCount}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">No. Surat Rekomendasi</label>
                                    <div className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-navy-900 font-semibold shadow-sm">
                                        {currentRefNumber}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Preview Dokumen</label>
                                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-4 text-center bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                                    <div className="w-14 h-14 bg-white shadow-md border border-gray-50 rounded-2xl flex items-center justify-center text-navy-900">
                                        <FileIcon size={28} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-bold text-navy-900 max-w-[180px] leading-relaxed line-clamp-1" title={documentName}>
                                            {documentName}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">PDF Document</p>
                                    </div>
                                    <a 
                                        href={recommendation.recommendation_doc_url || "#"} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white text-xs font-bold bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                    >
                                        Lihat
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl">
                                <button 
                                    onClick={() => setIsSesuai(true)}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isSesuai ? 'bg-white text-navy-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Sesuai
                                </button>
                                <button 
                                    onClick={() => setIsSesuai(false)}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isSesuai ? 'bg-navy-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Tidak Sesuai
                                </button>
                            </div>

                            {!isSesuai && (
                                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Alasan Tidak Sesuai</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Tuliskan catatan ketidaksesuaian..."
                                        value={alasan}
                                        onChange={(e) => setAlasan(e.target.value)}
                                        className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-sm outline-none focus:border-navy-900 focus:ring-4 focus:ring-navy-900/5 transition-all resize-none shadow-inner bg-gray-50/30"
                                    />
                                </div>
                            )}

                            <button 
                                onClick={handleSubmit}
                                disabled={acceptMutation.isPending || selectedIds.length === 0}
                                className={`w-full py-4.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 group ${
                                    acceptMutation.isPending || selectedIds.length === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-navy-900 hover:bg-navy-800 text-white shadow-xl shadow-navy-900/20 active:scale-[0.98]'
                                }`}
                            >
                                <Check size={18} className={`${acceptMutation.isPending ? 'hidden' : 'group-hover:scale-110 transition-transform'}`} />
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
