import React from 'react';
import { useRouter } from 'next/navigation';
import { Check, FileText } from 'lucide-react';
import {
    finishVerificationTransaction,
    VerificationTransaction
} from '@/api/verification';
import Link from 'next/link';
import { useDataPenelaahanStore } from '@/store/useDataPenelaahanStore';

const ReviewCard = ({
    item,
    token,
    onRefresh,
    viewMode
}: {
    item: VerificationTransaction;
    token: string | null;
    onRefresh: () => void;
    viewMode: string;
}) => {
    const router = useRouter();
    const { submittingTransactions, setSubmittingTransaction } = useDataPenelaahanStore();
    const isSubmitting = !!submittingTransactions[item.id];

    const isCompleted = item.status === 'completed';
    const isIssued = item.status === 'issued';
    const isVerificationDone = item.total_data > 0 && item.total_data === item.handled_data;

    const hasBA = !!item.ba_file_url;
    const isSelesai = item.status === 'recommended' || !!item.news;
    const isRekomendasi = item.status === 'completed' && hasBA;
    const isCetakBA = item.status === 'completed' && !hasBA;
    const isRecommended = isSelesai || isRekomendasi;

    const handleFinish = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSubmitting) return;

        if (!confirm(`Apakah Anda yakin ingin menandai penelaahan "${item.title}" sebagai selesai? Data yang sudah selesai tidak dapat diubah lagi.`)) {
            return;
        }

        setSubmittingTransaction(item.id, true);
        try {
            const res = await finishVerificationTransaction(token, item.id);
            if (!res.error) {
                onRefresh();
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
        <div
            onClick={() => router.push(`/v2/verifikator-kota/data-penelaahan/detail?transactionId=${item.id}`)}
            className="bg-white hover:bg-gray-100 rounded-xl border border-gray-300 p-4 transition-all cursor-pointer group space-y-4"
        >
                <div className="flex items-start gap-2">
                    <h3 className="text-lg transition-colors w-full font-semibold">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${
                        isSelesai ? 'text-green-600 border-green-600' :
                        isRekomendasi ? 'text-blue-600 border-blue-600' :
                        isCetakBA ? 'text-orange-600 border-orange-600' :
                        'text-gray-600 border-gray-200'
                    }`}>
                        {isSelesai ? 'Selesai' : isRekomendasi ? 'Rekomendasi' : isCetakBA ? 'Cetak BA' : 'Proses Penelaahan'}
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

                {isRecommended ? (
                    <Link
                        href={item.ba_file_url || ''}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2 rounded-lg text-sm font-bold bg-white border border-gray-300 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <FileText size={16} /> Lihat Berita Acara
                    </Link>
                ) : isCompleted ? (
                    <button className="w-full py-2 rounded-lg text-sm font-bold bg-navy-500 hover:bg-navy-400 text-white transition-all flex items-center justify-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/v2/verifikator-kota/data-penelaahan/cetak-ba?transactionId=${item.id}`); }}>
                        <FileText size={16} /> Cetak Berita Acara
                    </button>
                ) : isVerificationDone ? (
                    <button className="w-full py-2 rounded-lg text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); handleFinish(e); }} disabled={isSubmitting}>
                        <Check size={16} /> {isSubmitting ? "Memproses..." : "Tandai Selesai"}
                    </button>
                ) : null}
            </div>
    );
};

export default ReviewCard;
