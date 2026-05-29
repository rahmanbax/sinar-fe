import React from 'react';
import { useRouter } from 'next/navigation';
import { Check, FileText } from 'lucide-react';
import {
    finishVerificationTransaction,
    VerificationTransaction
} from '@/api/verification';
import Link from 'next/link';
import { useDataPenelaahanStore } from '@/store/useDataPenelaahanStore';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleDefaultRoute } from '@/types/User';

import { getBadgeColor, getBadgeLabel } from '@/utils/transactionStatus';

const ReviewCard = ({
    item,
    token,
    onRefresh,
    isLoading = false,
}: {
    item?: VerificationTransaction;
    token?: string | null;
    onRefresh?: () => void;
    viewMode?: string;
    isLoading?: boolean;
}) => {
    const router = useRouter();
    const { user } = useAuth();
    const basePath = user ? getRoleDefaultRoute(user) : '/v2/verifikator-kota';
    const { submittingTransactions, setSubmittingTransaction } = useDataPenelaahanStore();

    const isSubmitting = item ? !!submittingTransactions[item.id] : false;

    const isVerificationDone = item ? (item.total_data > 0 && item.total_data === item.handled_data) : false;

    const handleFinish = async (e: React.MouseEvent) => {
        if (!item) return;
        e.stopPropagation();
        if (isSubmitting) return;

        if (!confirm(`Apakah Anda yakin ingin menandai penelaahan "${item.title}" sebagai selesai? Data yang sudah selesai tidak dapat diubah lagi.`)) {
            return;
        }

        setSubmittingTransaction(item.id, true);
        try {
            const res = await finishVerificationTransaction(token ?? null, item.id);
            if (!res.error) {
                onRefresh?.();
            } else {
                alert(res.message || "Gagal menyelesaikan penelaahan");
            }
        } catch (err) {
            alert("Terjadi kesalahan koneksi");
        } finally {
            setSubmittingTransaction(item.id, false);
        }
    };

    return (
        isLoading || !item ? (
            <div className="bg-white border border-gray-300 rounded-xl p-4 flex flex-col gap-4 animate-pulse">
                <div className="flex justify-between items-start gap-2">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-16 shrink-0"></div>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-22 h-22 rounded-full bg-gray-200 shrink-0"></div>
                    <div className="flex flex-col gap-1.5 w-full">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/5"></div>
                    </div>
                </div>
                <div className="h-9 bg-gray-200 rounded-lg w-full mt-2"></div>
            </div>
        ) : (
            <div
                onClick={() => router.push(`${basePath}/data-penelaahan/detail?transactionId=${item.id}`)}
                className="bg-white hover:bg-gray-100 rounded-xl border border-gray-300 p-4 transition-all cursor-pointer group space-y-4"
            >
                <div className="flex items-start gap-2">
                    <h3 className="text-lg transition-colors w-full font-semibold">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold border whitespace-nowrap text-${getBadgeColor(item?.status_num)}-600 border-${getBadgeColor(item?.status_num)}-600`}>
                        {getBadgeLabel(item?.status_num)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 text-sm font-medium">
                    <div className="flex items-baseline gap-1">
                        <span className="">{item.element_count}</span>
                        <span className="text-gray-500">Jenis Unsur</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="">{item.district_count}</span>
                        <span className="text-gray-500">Kecamatan</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="">{item.total_data}</span>
                        <span className="text-gray-500">Total Data</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="">{item.handled_data}</span>
                        <span className="text-gray-500">Data Ditelaah</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="">{item.verificator_count}</span>
                        <span className="text-gray-500">Verifikator</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-22 h-22 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                            <circle cx="44" cy="44" r="36" stroke="#EF4444" strokeWidth="8" fill="transparent" strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * (item.accepted_data + item.rejected_data)) / (item.total_data || 1)} strokeLinecap="round" />
                            <circle cx="44" cy="44" r="36" stroke="#10B981" strokeWidth="8" fill="transparent" strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * item.accepted_data) / (item.total_data || 1)} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-900">{Math.round(((item.handled_data || 0) / (item.total_data || 1)) * 100)}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2 font-semibold">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                            <span className="text-gray-900 w-3">{item.accepted_data}</span>
                            <span className="text-gray-400">Data Disetujui</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-gray-900 w-3">{item.rejected_data}</span>
                            <span className="text-gray-400">Data Ditolak</span>
                        </div>
                    </div>
                </div>

                {item.is_owned && (
                    (item.status_num === 3 || item.status_num === 4) ? (
                        <Link
                            href={item.ba_file_url || ''}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-2 rounded-lg text-sm font-bold bg-white border border-gray-300 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FileText size={16} /> Lihat Berita Acara
                        </Link>
                    ) : item.status_num === 2 ? (
                        <button className="w-full py-2 rounded-lg text-sm font-bold bg-navy-500 hover:bg-navy-400 text-white transition-all flex items-center justify-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`${basePath}/data-penelaahan/cetak-ba?transactionId=${item.id}`); }}>
                            <FileText size={16} /> Cetak Berita Acara
                        </button>
                    ) : isVerificationDone ? (
                        <button className="w-full py-2 rounded-lg text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); handleFinish(e); }} disabled={isSubmitting}>
                            <Check size={16} /> {isSubmitting ? "Memproses..." : "Tandai Selesai"}
                        </button>
                    ) : null
                )}
            </div>
        )
    );
};

export default ReviewCard;
