"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import FileInput from "@/components/v2/inputs/FileInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateUserGuideMutation } from "@/hooks/useCms";
import { uploadDocs } from "@/api/media";

const TambahPetunjukPage = () => {
    const router = useRouter();
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [order, setOrder] = useState(0);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateUserGuideMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError("Judul wajib diisi.");
        if (!pdfFile) return setError("File PDF wajib diunggah.");

        setUploading(true);
        let fileUrl: string;
        try {
            const uploaded = await uploadDocs(pdfFile, token);
            if (uploaded.error) throw new Error(uploaded.message);
            fileUrl = uploaded.data.url;
        } catch {
            setError("Gagal mengunggah file PDF.");
            setUploading(false);
            return;
        }
        setUploading(false);

        createMutation.mutate(
            { token, data: { title, file_url: fileUrl, order } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/petunjuk-penggunaan"),
                onError: (err) => setError(err.message),
            }
        );
    };

    const isSubmitting = uploading || createMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Petunjuk Penggunaan</h1>
                        <p className="text-sm text-gray-500">Unggah dokumen PDF petunjuk penggunaan</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    <TextInput
                        id="title"
                        label="Judul Petunjuk"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Contoh: Petunjuk Penggunaan untuk Surveyor"
                    />

                    <FileInput
                        id="pdf-file"
                        label="File PDF"
                        accept=".pdf"
                        onChange={setPdfFile}
                        required
                        instructions="Unggah file dengan format: .pdf"
                        maxSizeMB={20}
                    />

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Urutan Tampil
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Angka kecil ditampilkan lebih atas</p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <ButtonComponent
                            type="submit"
                            label={isSubmitting ? "Menyimpan..." : "Simpan"}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default TambahPetunjukPage;
