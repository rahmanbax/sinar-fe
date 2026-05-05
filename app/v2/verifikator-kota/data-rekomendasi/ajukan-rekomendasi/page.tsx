"use client";

import React, { useState } from "react";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import FileInput from "@/components/v2/inputs/FileInput";
import { ChevronRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useCompletedVerificationTransactions, useCreateRecommendationMutation } from "@/hooks/useVerificationTransactions";
import { VerificationTransaction } from "@/api/verification";
import { uploadDocs } from "@/api/media";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";

const AjukanRekomendasiPage = () => {
    const router = useRouter();
    const { token } = useAuth();
    const { data: transactionsRes, isLoading } = useCompletedVerificationTransactions();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Form States
    const [noSurat, setNoSurat] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { mutateAsync: createRec, isPending } = useCreateRecommendationMutation();

    const transactions: VerificationTransaction[] = transactionsRes?.data || [];

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.map(d => d.id));
        }
    };

    // Calculate total data count from selected transactions
    const totalSelectedData = transactions
        .filter(t => selectedIds.includes(t.id))
        .reduce((sum, t) => sum + (t.accepted_data || 0), 0);

    // Form Validation
    const isValid = selectedIds.length > 0 && noSurat.trim() !== "" && selectedFile !== null;

    const handleSubmit = async () => {
        if (!isValid) return;

        try {
            // Step 1: Upload Document first
            const uploadRes = await uploadDocs(selectedFile, token);
            if (uploadRes.error) {
                alert(uploadRes.message || "Gagal mengunggah surat");
                return;
            }

            const docUrl = uploadRes.data.url;

            // Step 2: Create Recommendation with the doc URL
            const payload = {
                ref_number: noSurat,
                recommendation_doc_url: docUrl,
                transaction_ids: selectedIds
            };

            const res = await createRec(payload);
            if (!res.error) {
                router.push("/v2/verifikator-kota/data-rekomendasi");
            } else {
                alert(res.message || "Gagal mengajukan rekomendasi");
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem");
        }
    };

    return (
        <DashboardLayout showNav={false}>
            <div className="w-full flex flex-col gap-8 py-4 md:px-12 lg:px-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400">
                    <Link href="/v2/verifikator-kota" className="hover:text-navy-600 transition-colors">Dashboard</Link>
                    <ChevronRight size={14} />
                    <Link href="/v2/verifikator-kota/data-rekomendasi" className="hover:text-navy-600 transition-colors">Data Rekomendasi</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-semibold">Ajukan Rekomendasi</span>
                </nav>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900">Ajukan Rekomendasi</h1>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    
                    {/* Left Column: Pilih Penelaahan */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-bold text-gray-900">Pilih Penelaahan</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                             <input 
                                                 type="checkbox" 
                                                 className="w-4 h-4 rounded border-gray-300 accent-navy-600 cursor-pointer"
                                                 checked={transactions.length > 0 && selectedIds.length === transactions.length}
                                                 onChange={toggleSelectAll}
                                             />
                                         </th>
                                         <th className="px-4 py-3 w-12 text-center">No</th>
                                         <th className="px-4 py-3">Judul Penelaahan</th>
                                         <th className="px-4 py-3 text-right">Jumlah Data</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {isLoading ? (
                                         <tr>
                                             <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                                                 <p className="animate-pulse">Memuat data penelaahan...</p>
                                             </td>
                                         </tr>
                                     ) : transactions.length === 0 ? (
                                         <tr>
                                             <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                                                 Tidak ada data penelaahan yang selesai.
                                             </td>
                                         </tr>
                                     ) : (
                                         transactions.map((item, idx) => (
                                             <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                 <td className="px-4 py-4">
                                                     <input 
                                                         type="checkbox" 
                                                         className="w-4 h-4 rounded border-gray-300 accent-navy-600 cursor-pointer"
                                                         checked={selectedIds.includes(item.id)}
                                                         onChange={() => toggleSelect(item.id)}
                                                     />
                                                 </td>
                                                 <td className="px-4 py-4 text-center text-gray-900">{idx + 1}</td>
                                                 <td className="px-4 py-4 text-gray-900">{item.title}</td>
                                                 <td className="px-4 py-4 text-right text-gray-900 font-medium">{item.accepted_data}</td>
                                             </tr>
                                         ))
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>
 
                     {/* Right Column: Submission Form */}
                     <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
                         {/* Jumlah Data (ReadOnly) */}
                         <div>
                             <label className="block text-sm font-semibold text-gray-900 mb-2">Jumlah Data</label>
                             <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-medium">
                                 {totalSelectedData}
                             </div>
                         </div>

                        {/* No. Surat Rekomendasi */}
                        <TextInput 
                            id="no_surat"
                            label="No. Surat Rekomendasi"
                            value={noSurat}
                            onChange={(e) => setNoSurat(e.target.value)}
                        />

                        {/* Unggah Surat */}
                        <FileInput 
                            id="unggah_surat"
                            label="Unggah Surat"
                            onChange={(file) => setSelectedFile(file)}
                            instructions="Klik untuk unggah Surat"
                            icon={<FileText size={20} className="text-gray-400" />}
                        />

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <ButtonComponent 
                                label="Batalkan"
                                secondary
                                className="w-full py-2.5"
                                onClick={() => router.back()}
                            />
                            <ButtonComponent 
                                label={isPending ? "Memproses..." : "Ajukan"}
                                disabled={!isValid || isPending}
                                className={`w-full py-2.5 border-none transition-all ${
                                    isValid 
                                    ? "bg-navy-900 hover:bg-navy-800 text-white cursor-pointer" 
                                    : "bg-gray-400 text-white cursor-not-allowed"
                                }`}
                                onClick={handleSubmit}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default AjukanRekomendasiPage;
