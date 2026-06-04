"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import FileInput from "@/components/v2/inputs/FileInput";
import { useAuth } from "@/contexts/AuthContext";
import { useUserGuideDetail, useUpdateUserGuideMutation } from "@/hooks/useCms";
import { uploadDocs } from "@/api/media";

const EditPetunjukPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const { data: response, isLoading } = useUserGuideDetail(token, id);
    const guide = response?.data;

    const [title, setTitle] = useState("");
    const [order, setOrder] = useState(0);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (guide) {
            setTitle(guide.title);
            setOrder(guide.order);
        }
    }, [guide]);

    const updateMutation = useUpdateUserGuideMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError("Judul wajib diisi.");

        let fileUrl = guide?.file_url ?? "";

        if (pdfFile) {
            setUploading(true);
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
        }

        if (!fileUrl) return setError("File PDF wajib ada.");

        updateMutation.mutate(
            { token, id, data: { title, file_url: fileUrl, order } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/petunjuk-penggunaan"),
                onError: (err) => setError(err.message),
            }
        );
    };

    const isSubmitting = uploading || updateMutation.isPending;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">Memuat data...</div>
            </DashboardLayout>
        );
    }

    if (!guide) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">Data tidak ditemukan.</div>
            </DashboardLayout>
        );
    }

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
                        <h1 className="text-2xl font-bold">Edit Petunjuk Penggunaan</h1>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{guide.title}</p>
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
                        instructions="Biarkan kosong untuk mempertahankan file lama"
                        maxSizeMB={20}
                        initialUrl={guide.file_url}
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
                            label={isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditPetunjukPage;
