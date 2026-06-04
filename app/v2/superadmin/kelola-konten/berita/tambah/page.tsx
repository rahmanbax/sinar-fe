"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import RichTextEditor from "@/components/v2/inputs/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateNewsMutation } from "@/hooks/useCms";
import { uploadImage } from "@/api/media";

const TambahBeritaPage = () => {
    const router = useRouter();
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateNewsMutation();

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setThumbnailFile(file);
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
        } else {
            setThumbnailPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError("Judul wajib diisi.");
        if (!content.trim()) return setError("Konten wajib diisi.");

        let thumbnailUrl: string | undefined;

        if (thumbnailFile) {
            setUploadingImage(true);
            try {
                const uploaded = await uploadImage(thumbnailFile, token);
                if (uploaded.error) throw new Error(uploaded.message);
                thumbnailUrl = uploaded.data.url;
            } catch {
                setError("Gagal mengunggah thumbnail.");
                setUploadingImage(false);
                return;
            }
            setUploadingImage(false);
        }

        createMutation.mutate(
            { token, data: { title, content, thumbnail_url: thumbnailUrl, status } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/berita"),
                onError: (err) => setError(err.message),
            }
        );
    };

    const isSubmitting = uploadingImage || createMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Berita</h1>
                        <p className="text-sm text-gray-500">Buat konten berita baru</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    <TextInput
                        id="title"
                        label="Judul Berita"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Masukkan judul berita"
                    />

                    <RichTextEditor
                        label="Konten"
                        value={content}
                        onChange={setContent}
                        required
                        placeholder="Tulis konten berita di sini..."
                    />

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Thumbnail
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {thumbnailPreview ? (
                                <div className="relative">
                                    <img
                                        src={thumbnailPreview}
                                        alt="preview"
                                        className="w-full max-h-56 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                                        className="mt-2 text-sm text-red-500 hover:underline"
                                    >
                                        Hapus thumbnail
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="thumbnail"
                                    className="flex flex-col items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700"
                                >
                                    <Upload size={24} />
                                    <span className="text-sm">Klik untuk unggah gambar</span>
                                    <span className="text-xs text-gray-400">JPG, PNG, WEBP (Maks. 5MB)</span>
                                    <input
                                        id="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleThumbnailChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Publikasikan</option>
                        </select>
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
                            label={isSubmitting ? "Menyimpan..." : "Simpan Berita"}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default TambahBeritaPage;
